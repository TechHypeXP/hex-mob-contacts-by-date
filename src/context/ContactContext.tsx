import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as Contacts from 'expo-contacts';
import { Contact, ContactStats, SearchFilters } from '@/types/contact';

// Configuration constants for performance optimization
import { ConfigService } from '@/src/config/ConfigService';

const INCREMENTAL_CONFIG = {
  INITIAL_BATCH: ConfigService.get<number>('performance.virtualization.initialNumToRender'),
  BATCH_SIZE: ConfigService.get<number>('performance.virtualization.maxToRenderPerBatch'),
  BACKGROUND_THRESHOLD: 200, // ms (This is not in the config, so keep it as is)
  MAX_MEMORY_CONTACTS: 6500, // This is not in the config, so keep it as is
  SEARCH_DEBOUNCE: ConfigService.get<number>('performance.debouncing.searchDelay'),
} as const;

interface ContactContextType {
  contacts: Contact[];
  filteredContacts: Contact[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  filters: SearchFilters;
  stats: ContactStats;
  lastSyncTime: Date | null;
  loadContacts: () => Promise<void>;
  loadMoreContacts: () => Promise<void>;
  toggleFavorite: (contactId: string) => Promise<void>;
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
  refreshContacts: () => Promise<void>;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

/**
 * Transforms Expo contact to our Contact interface
 */
function transformExpoContact(expoContact: Contacts.Contact): Contact {
  const sourceType = (expoContact as any).contactType || 'device';
  const sourceName = (expoContact as any).accountName || 'Device';
  
  return {
    id: expoContact.id || '',
    name: expoContact.name || 'Unknown Contact',
    firstName: expoContact.firstName || undefined,
    lastName: expoContact.lastName || undefined,
    phoneNumbers: (expoContact.phoneNumbers || []).map((phone, index) => ({
      id: `${expoContact.id}-phone-${index}`,
      number: phone?.number || '',
      label: phone?.label || 'mobile',
      isPrimary: index === 0,
    })),
    emails: (expoContact.emails || []).map((email, index) => ({
      id: `${expoContact.id}-email-${index}`,
      email: email?.email || '',
      label: email?.label || 'personal',
      isPrimary: index === 0,
    })),
    addresses: (expoContact.addresses || []).map((address, index) => ({
      id: `${expoContact.id}-address-${index}`,
      street: address?.street || undefined,
      city: address?.city || undefined,
      state: address?.region || undefined,
      postalCode: address?.postalCode || undefined,
      country: address?.country || undefined,
      label: address?.label || 'home',
    })),
    jobTitle: expoContact.jobTitle || undefined,
    company: expoContact.company || undefined,
    notes: expoContact.note || undefined,
    source: {
      type: sourceType as any,
      name: sourceName,
      accountId: (expoContact as any).accountId || undefined,
    },
    imageUri: expoContact.image?.uri || undefined,
    createdAt: new Date((expoContact as any).creationDate || Date.now()),
    modifiedAt: new Date((expoContact as any).modificationDate || Date.now()),
    tags: [],
    isFavorite: false,
  };
}

/**
 * Calculates contact statistics
 */
function calculateStats(contacts: Contact[]): ContactStats {
  const stats: ContactStats = {
    total: contacts.length,
    bySource: {},
    favorites: 0,
    withPhotos: 0,
  };

  contacts.forEach(contact => {
    const sourceType = contact.source.type;
    stats.bySource[sourceType] = (stats.bySource[sourceType] || 0) + 1;
    
    if (contact.isFavorite) stats.favorites++;
    if (contact.imageUri) stats.withPhotos++;
  });

  return stats;
}

/**
 * Simple but effective search function for multi-keyword search
 */
function searchContacts(contacts: Contact[], query: string): Contact[] {
  if (!query.trim()) return contacts;
  
  const keywords = query.toLowerCase().trim().split(/\s+/);
  
  return contacts.filter(contact => {
    const searchableText = [
      contact.name,
      contact.firstName,
      contact.lastName,
      contact.company,
      contact.jobTitle,
      contact.notes,
      ...contact.phoneNumbers.map(p => p.number),
      ...contact.emails.map(e => e.email),
    ].filter(Boolean).join(' ').toLowerCase();
    
    // All keywords must be found (AND logic)
    return keywords.every(keyword => searchableText.includes(keyword));
  });
}

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    bySource: {},
    favorites: 0,
    withPhotos: 0,
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    source: undefined,
    sortBy: 'modifiedAt',
    sortOrder: 'desc',
    showFavoritesOnly: false,
  });

  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(false);
  const allContactsRef = useRef<Contact[]>([]); // To hold all contacts for filtering/searching

  /**
   * Applies filters to contacts with incremental loading support
   */
  const applyFilters = useCallback((allContacts: Contact[], currentFilters: SearchFilters) => {
    let filtered = [...allContacts];

    // Apply source filter
    if (currentFilters.source) {
      filtered = filtered.filter(contact => contact.source.type === currentFilters.source);
    }

    // Apply favorites filter
    if (currentFilters.showFavoritesOnly) {
      filtered = filtered.filter(contact => contact.isFavorite);
    }

    // Apply search query with multi-keyword support (AND/OR)
    if (currentFilters.query.trim()) {
      filtered = searchContacts(filtered, currentFilters.query);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[currentFilters.sortBy];
      const bValue = b[currentFilters.sortBy];
      
      if (currentFilters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, []);

  /**
   * Loads remaining contacts in background batches
   */
  const loadRemainingInBackground = useCallback(
    async (allContacts: Contact[], startIndex: number) => {
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
      }

      const loadNextBatch = () => {
        const nextBatch = allContacts.slice(
          startIndex,
          startIndex + INCREMENTAL_CONFIG.BATCH_SIZE
        );

        if (nextBatch.length > 0) {
          setContacts(prev => [...prev, ...nextBatch]);
          setLoadedCount(prev => prev + nextBatch.length);
          
          const newStartIndex = startIndex + nextBatch.length;
          if (newStartIndex < allContacts.length) {
            backgroundTimerRef.current = setTimeout(
              () => loadNextBatch(),
              INCREMENTAL_CONFIG.BACKGROUND_THRESHOLD
            );
          } else {
            setHasMore(false);
          }
        }
      };

      backgroundTimerRef.current = setTimeout(
        loadNextBatch,
        INCREMENTAL_CONFIG.BACKGROUND_THRESHOLD
      );
    },
    []
  );

  /**
   * Loads contacts from device with incremental loading
   */
  const loadContacts = useCallback(async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Contact permissions denied');
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Addresses,
          Contacts.Fields.Image,
          Contacts.Fields.JobTitle,
          Contacts.Fields.Company,
          Contacts.Fields.Note,
        ],
        pageSize: INCREMENTAL_CONFIG.MAX_MEMORY_CONTACTS,
        pageOffset: 0,
      });

      const transformedContacts = data.map(transformExpoContact);
      
      // Update allContactsRef and derived states
      allContactsRef.current = transformedContacts;
      setStats(calculateStats(transformedContacts));
      setLastSyncTime(new Date());

      // Load initial batch
      const initialBatch = transformedContacts.slice(0, INCREMENTAL_CONFIG.INITIAL_BATCH);
      setContacts(initialBatch);
      setLoadedCount(initialBatch.length);
      setHasMore(initialBatch.length < transformedContacts.length);

      // Start background loading
      if (transformedContacts.length > initialBatch.length) {
        loadRemainingInBackground(transformedContacts, initialBatch.length);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [loadRemainingInBackground]);

  /**
   * Loads more contacts (for pagination)
   */
  const loadMoreContacts = useCallback(async () => {
    if (loadingMore || !hasMore || isLoadingRef.current) return;

    setLoadingMore(true);
    
    try {
      const nextBatch = allContactsRef.current.slice(
        loadedCount,
        loadedCount + INCREMENTAL_CONFIG.BATCH_SIZE
      );

      if (nextBatch.length > 0) {
        setContacts(prev => [...prev, ...nextBatch]);
        setLoadedCount(prev => prev + nextBatch.length);
        
        if (loadedCount + nextBatch.length >= allContactsRef.current.length) {
          setHasMore(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more contacts');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loadedCount]);

  /**
   * Refreshes contacts, implementing delta-sync to only update modified ones.
   */
  const refreshContacts = useCallback(async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Contact permissions denied');
      }

      const { data: newExpoContacts } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Addresses,
          Contacts.Fields.Image,
          Contacts.Fields.JobTitle,
          Contacts.Fields.Company,
          Contacts.Fields.Note,
        ],
        pageSize: INCREMENTAL_CONFIG.MAX_MEMORY_CONTACTS,
        pageOffset: 0,
      });

      const newTransformedContacts = newExpoContacts.map(transformExpoContact);

      // Implement delta-sync logic
      const updatedContactsMap = new Map<string, Contact>();
      
      // Add existing contacts to map
      allContactsRef.current.forEach(contact => updatedContactsMap.set(contact.id, contact));

      // Add/update new contacts, prioritizing newer modification dates
      newTransformedContacts.forEach(newContact => {
        const existingContact = updatedContactsMap.get(newContact.id);
        if (!existingContact || newContact.modifiedAt > existingContact.modifiedAt) {
          updatedContactsMap.set(newContact.id, newContact);
        }
      });

      const finalContacts = Array.from(updatedContactsMap.values());

      // Update allContactsRef and derived states
      allContactsRef.current = finalContacts;
      setStats(calculateStats(finalContacts));
      setLastSyncTime(new Date());

      // Reset loaded count and set initial batch for display
      const initialBatch = finalContacts.slice(0, INCREMENTAL_CONFIG.INITIAL_BATCH);
      setContacts(initialBatch);
      setLoadedCount(initialBatch.length);
      setHasMore(initialBatch.length < finalContacts.length);

      // Start background loading for remaining contacts
      if (finalContacts.length > initialBatch.length) {
        loadRemainingInBackground(finalContacts, initialBatch.length);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh contacts');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [loadRemainingInBackground]);

  /**
   * Toggles favorite status for a contact
   */
  const toggleFavorite = useCallback(async (contactId: string) => {
    // Update allContactsRef
    const contactIndex = allContactsRef.current.findIndex(c => c.id === contactId);
    if (contactIndex !== -1) {
      allContactsRef.current[contactIndex].isFavorite = !allContactsRef.current[contactIndex].isFavorite;
      setStats(calculateStats(allContactsRef.current));
    }

    // Update local state (contacts displayed)
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, isFavorite: !contact.isFavorite }
          : contact
      )
    );
  }, []);

  /**
   * Updates filters and re-applies them
   */
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Initial load of contacts
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Apply filters when allContactsRef.current or filters change
  useEffect(() => {
    const filtered = applyFilters(allContactsRef.current, filters);
    setFilteredContacts(filtered);
  }, [allContactsRef.current, filters, applyFilters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
      }
    };
  }, []);

  const contextValue = useMemo(() => ({
    contacts,
    filteredContacts,
    loading,
    loadingMore,
    error,
    filters,
    stats,
    lastSyncTime,
    loadContacts,
    loadMoreContacts,
    toggleFavorite,
    updateFilters,
    refreshContacts,
  }), [
    contacts,
    filteredContacts,
    loading,
    loadingMore,
    error,
    filters,
    stats,
    lastSyncTime,
    loadContacts,
    loadMoreContacts,
    toggleFavorite,
    updateFilters,
    refreshContacts,
  ]);

  return (
    <ContactContext.Provider value={contextValue}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};