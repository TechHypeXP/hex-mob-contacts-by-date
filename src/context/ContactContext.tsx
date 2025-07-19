import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as Contacts from 'expo-contacts';
import { Contact, ContactStats, SearchFilters } from '@/types/contact';
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

// CORRECTED FUSE.JS OPTIONS FOR "AND" SEARCH
const FUSE_OPTIONS = {
  keys: ['name', 'phoneNumbers.number', 'emails.email', 'company', 'jobTitle'],
  threshold: 0.4,
  includeScore: true,
  useExtendedSearch: true, // Enables advanced search operators
};

// REWRITTEN DATA TRANSFORMATION
function transformExpoContact(rawContact: Contacts.Contact): Contact {
  const getValidDate = (timestamp: number | undefined | null): Date => {
    if (!timestamp || timestamp <= 0) return new Date(1980, 0, 1);
    return new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
  };

  const getSourceType = (source: any): 'google' | 'sim' | 'exchange' | 'device' | 'other' => {
    const name = source?.name?.toLowerCase() || '';
    if (name.includes('gmail')) return 'google';
    if (name.includes('sim')) return 'sim';
    if (name.includes('exchange')) return 'exchange';
    return 'device';
  };

  const sourceInfo = (rawContact as any).source;
  const sourceType = getSourceType(sourceInfo);

  return {
    id: rawContact.id || '',
    name: rawContact.name || 'No Name',
    firstName: rawContact.firstName,
    lastName: rawContact.lastName,
    phoneNumbers: (rawContact.phoneNumbers || []).map((p, i) => ({ id: p.id || `${rawContact.id}-p${i}`, number: p.number || '', label: p.label || 'phone' })),
    emails: (rawContact.emails || []).map((e, i) => ({ id: e.id || `${rawContact.id}-e${i}`, email: e.email || '', label: e.label || 'email' })),
    addresses: (rawContact.addresses || []).map(a => ({ ...a, id: a.id || '' })),
    jobTitle: rawContact.jobTitle,
    company: rawContact.company,
    notes: rawContact.note,
    source: { type: sourceType, name: sourceInfo?.name || 'Device' },
    imageUri: rawContact.imageAvailable ? rawContact.image?.uri : undefined,
    createdAt: getValidDate((rawContact as any).creationDate),
    modifiedAt: getValidDate((rawContact as any).modificationDate),
    tags: [],
    isFavorite: false,
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
        setError('Contact permissions are required.'); setHasPermissions(false); setAllContacts([]); return;
      }
      setHasPermissions(true);
      const { data } = await Contacts.getContactsAsync({ fields: Object.values(Contacts.Fields) });
      const transformed = data.map(transformExpoContact);
      setAllContacts(transformed);
      fuseRef.current = new Fuse(transformed, FUSE_OPTIONS);
      setLastSyncTime(new Date());
    } catch (e) { setError('Failed to load contacts.');
    } finally { if (!refreshing) setLoading(false); }
  }, [refreshing]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  const refreshContacts = useCallback(async () => { setRefreshing(true); await loadContacts(); setRefreshing(false); }, [loadContacts]);
  const toggleFavorite = useCallback(async (contactId: string) => { setFavorites((prev: Record<string, boolean>) => ({ ...prev, [contactId]: !prev[contactId] })); }, []);
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => { setFilters((prev: SearchFilters) => ({ ...prev, ...newFilters })); }, []);

  const filteredContacts = useMemo(() => {
      // This query now enables AND search. e.g., "'shots 'rehab"
      const fuseQuery = filters.query.trim().split(' ').map(term => `'${term}`).join(' ');
      
      let processed = fuseQuery ? (fuseRef.current?.search(fuseQuery).map(r => r.item) || []) : [...allContacts];
      
      // ... rest of the filtering and sorting logic
      if (filters.showFavoritesOnly) processed = processed.filter(c => favorites[c.id]);
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
