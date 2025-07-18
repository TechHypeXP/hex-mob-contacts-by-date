import { useState, useEffect, useCallback } from 'react';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, SearchFilters, ContactStats } from '@/types/contact';

const STORAGE_KEYS = {
  CONTACTS: 'contacts_data',
  FILTERS: 'contact_filters',
  FAVORITES: 'favorite_contacts',
  LAST_SYNC: 'last_sync_timestamp',
};

const BATCH_SIZE = 50; // Load contacts in batches for better performance

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [displayedContacts, setDisplayedContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    bySource: {},
    favorites: 0,
    withPhotos: 0,
  });

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'name',
    sortOrder: 'asc',
    showFavoritesOnly: false,
  });

  // Incremental loading for large datasets
  const loadMoreContacts = useCallback(() => {
    if (loadingMore || displayedContacts.length >= filteredContacts.length) return;
    
    setLoadingMore(true);
    const nextBatch = filteredContacts.slice(
      displayedContacts.length,
      displayedContacts.length + BATCH_SIZE
    );
    
    setTimeout(() => {
      setDisplayedContacts(prev => [...prev, ...nextBatch]);
      setLoadingMore(false);
    }, 100); // Small delay to prevent UI blocking
  }, [displayedContacts.length, filteredContacts.length, loadingMore]);

  // Load contacts from device
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Request permissions
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Contacts permission not granted');
      }

      // Get contacts from device
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Addresses,
          Contacts.Fields.Company,
          Contacts.Fields.JobTitle,
          Contacts.Fields.Note,
          Contacts.Fields.Image,
          Contacts.Fields.RawImage,
          Contacts.Fields.Dates,
        ],
      });

      // Transform contacts to our format
      const transformedContacts: Contact[] = data.map((contact) => {
        return {
        id: contact.id || Date.now().toString(),
        name: contact.name || 'Unknown',
        firstName: contact.firstName,
        lastName: contact.lastName,
        phoneNumbers: contact.phoneNumbers?.map((phone, index) => ({
          id: `${contact.id}-phone-${index}`,
          number: phone.number || '',
          label: phone.label || 'mobile',
          isPrimary: index === 0,
        })) || [],
        emails: contact.emails?.map((email, index) => ({
          id: `${contact.id}-email-${index}`,
          email: email.email || '',
          label: email.label || 'personal',
          isPrimary: index === 0,
        })) || [],
        addresses: contact.addresses?.map((address, index) => ({
          id: `${contact.id}-address-${index}`,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          label: address.label || 'home',
        })) || [],
        jobTitle: contact.jobTitle,
        company: contact.company,
        notes: contact.note,
        source: {
          type: 'device',
          name: 'Device Contacts',
        },
        imageUri: contact.imageAvailable ? contact.image?.uri : undefined,
        createdAt: contact.dates?.find(d => d.label === 'created')?.date || new Date(contact.id ? parseInt(contact.id) : Date.now()),
        modifiedAt: contact.dates?.find(d => d.label === 'modified')?.date || new Date(contact.id ? parseInt(contact.id) : Date.now()),
        tags: [],
        isFavorite: false,
      };
      });

      // Load favorites from storage
      const favoritesData = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      const favoriteIds = favoritesData ? JSON.parse(favoritesData) : [];

      // Mark favorites
      transformedContacts.forEach(contact => {
        contact.isFavorite = favoriteIds.includes(contact.id);
      });

      setContacts(transformedContacts);
      
      // Update last sync time
      const syncTime = new Date();
      setLastSyncTime(syncTime);
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, syncTime.toISOString());

      // Calculate stats
      const newStats: ContactStats = {
        total: transformedContacts.length,
        bySource: {
          device: transformedContacts.filter(c => c.source.type === 'device').length,
        },
        favorites: transformedContacts.filter(c => c.isFavorite).length,
        withPhotos: transformedContacts.filter(c => c.imageUri).length,
      };
      setStats(newStats);

      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(transformedContacts));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort contacts
  const applyFilters = useCallback(() => {
    let filtered = [...contacts];

    // Apply text search
    if (filters.query.trim()) {
      const keywords = filters.query.toLowerCase().trim().split(/\s+/).filter(k => k.length > 0);
      filtered = filtered.filter(contact => 
        keywords.every(keyword => {
          const searchableText = [
            contact.name,
            contact.firstName || '',
            contact.lastName || '',
            contact.jobTitle || '',
            contact.company || '',
            ...contact.tags,
            ...contact.phoneNumbers.map(p => p.number),
            ...contact.emails.map(e => e.email),
          ].join(' ').toLowerCase();
          return searchableText.includes(keyword);
        })
        )
      );
    }

    // Apply source filter
    if (filters.source && filters.source !== 'all') {
      filtered = filtered.filter(contact => contact.source.type === filters.source);
    }

    // Apply favorites filter
    if (filters.showFavoritesOnly) {
      filtered = filtered.filter(contact => contact.isFavorite);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'modifiedAt':
          aValue = a.modifiedAt;
          bValue = b.modifiedAt;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredContacts(filtered);
    
    // Reset displayed contacts and load first batch
    const firstBatch = filtered.slice(0, BATCH_SIZE);
    setDisplayedContacts(firstBatch);
  }, [contacts, filters]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (contactId: string) => {
    const updatedContacts = contacts.map(contact => {
      if (contact.id === contactId) {
        return { ...contact, isFavorite: !contact.isFavorite };
      }
      return contact;
    });

    setContacts(updatedContacts);

    // Update favorites in storage
    const favoriteIds = updatedContacts
      .filter(c => c.isFavorite)
      .map(c => c.id);
    
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteIds));

    // Update stats
    setStats(prev => ({
      ...prev,
      favorites: favoriteIds.length,
    }));
  }, [contacts]);

  // Update filters
  const updateFilters = useCallback(async (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    await AsyncStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(updatedFilters));
  }, [filters]);

  // Load saved filters on mount
  useEffect(() => {
    const loadSavedFilters = async () => {
      try {
        const savedFilters = await AsyncStorage.getItem(STORAGE_KEYS.FILTERS);
        if (savedFilters) {
          setFilters(JSON.parse(savedFilters));
        }
      } catch (err) {
        console.warn('Failed to load saved filters:', err);
      }
    };

    loadSavedFilters();
    loadContacts();
  }, [loadContacts]);

  // Apply filters when contacts or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    contacts: displayedContacts,
    allContacts: contacts,
    filteredContacts,
    loading,
    loadingMore,
    error,
    stats,
    filters,
    lastSyncTime,
    loadContacts,
    loadMoreContacts,
    toggleFavorite,
    updateFilters,
  };
}