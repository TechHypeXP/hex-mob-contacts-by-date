import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as Contacts from 'expo-contacts';
import { Contact, ContactStats, SearchFilters } from 'types/contact';
import Fuse from 'fuse.js';

interface ContactContextType {
  filteredContacts: Contact[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  filters: SearchFilters;
  stats: ContactStats;
  lastSyncTime: Date | null;
  hasPermissions: boolean;
  refreshContacts: () => Promise<void>;
  toggleFavorite: (contactId: string) => Promise<void>;
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

const FUSE_OPTIONS = {
  keys: ['name', 'phoneNumbers.number', 'emails.email', 'company', 'jobTitle'],
  threshold: 0.3,
  ignoreLocation: true,
};

function transformExpoContact(expoContact: Contacts.Contact): Contact {
    const getValidDate = (timestamp: number | undefined | null): Date => {
        if (timestamp && timestamp > 0) {
            return new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
        }
        return new Date(1970, 1, 1);
    };
    const createdAt = getValidDate((expoContact as any).creationDate);
    const modifiedAt = getValidDate((expoContact as any).modificationDate);
    return {
        id: expoContact.id || '', name: expoContact.name || 'Unknown',
        firstName: expoContact.firstName, lastName: expoContact.lastName,
        phoneNumbers: (expoContact.phoneNumbers || []).map((p, i) => ({ id: p.id || `${expoContact.id}-p${i}`, number: p.number || '', label: p.label || 'phone' })),
        emails: (expoContact.emails || []).map((e, i) => ({ id: e.id || `${expoContact.id}-e${i}`, email: e.email || '', label: e.label || 'email' })),
        addresses: [], jobTitle: expoContact.jobTitle, company: expoContact.company, notes: expoContact.note,
        source: { type: 'device', name: 'Device' },
        imageUri: expoContact.imageAvailable ? expoContact.image?.uri : undefined,
        createdAt: createdAt > modifiedAt ? modifiedAt : createdAt,
        modifiedAt: modifiedAt,
        tags: [], isFavorite: false,
    };
}

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<SearchFilters>({ query: '', source: undefined, sortBy: 'modifiedAt', sortOrder: 'desc', showFavoritesOnly: false });
  const fuseRef = useRef<Fuse<Contact> | null>(null);

  const loadContacts = useCallback(async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Contact permissions are required to use this app.');
        setHasPermissions(false); setAllContacts([]); return;
      }
      setHasPermissions(true);
      const { data } = await Contacts.getContactsAsync({ fields: Object.values(Contacts.Fields) });
      const transformed = data.map(transformExpoContact);
      setAllContacts(transformed);
      fuseRef.current = new Fuse(transformed, FUSE_OPTIONS);
      setLastSyncTime(new Date());
    } catch (e) {
      setError('Failed to load contacts.');
    } finally {
      if (!refreshing) setLoading(false);
    }
  }, [refreshing]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  const refreshContacts = useCallback(async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  }, [loadContacts]);

  const toggleFavorite = useCallback(async (contactId: string) => {
    setFavorites(prev => ({ ...prev, [contactId]: !prev[contactId] }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const filteredContacts = useMemo(() => {
    let processed = filters.query.trim() ? (fuseRef.current?.search(filters.query).map(r => r.item) || []) : [...allContacts];
    if (filters.showFavoritesOnly) {
        processed = processed.filter(c => favorites[c.id]);
    }
    processed.forEach(c => c.isFavorite = !!favorites[c.id]);
    processed.sort((a, b) => {
      const aVal = a[filters.sortBy]; const bVal = b[filters.sortBy];
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      if (aVal instanceof Date && bVal instanceof Date) return (aVal.getTime() - bVal.getTime()) * order;
      if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal) * order;
      return 0;
    });
    return processed;
  }, [allContacts, filters, favorites]);

  const stats = useMemo((): ContactStats => allContacts.reduce((acc, c) => {
    acc.total++; if (c.imageUri) acc.withPhotos++;
    acc.bySource[c.source.type] = (acc.bySource[c.source.type] || 0) + 1;
    return acc;
  }, { total: 0, bySource: {}, favorites: Object.values(favorites).filter(Boolean).length, withPhotos: 0 }), [allContacts, favorites]);

  const value = { filteredContacts, loading, refreshing, error, filters, stats, lastSyncTime, hasPermissions, refreshContacts, toggleFavorite, updateFilters };
  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
};

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) throw new Error('useContacts must be used within a ContactProvider');
  return context;
};