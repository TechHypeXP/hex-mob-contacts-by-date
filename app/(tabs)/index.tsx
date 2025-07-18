import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { ContactList } from '@/components/ContactList';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { FilterModal } from '@/components/FilterModal';
import { ContactDetails } from '@/components/ContactDetails';
import { useContacts } from '@/hooks/useContacts';
import { useDebounce } from '@/hooks/useDebounce';
import { useTheme } from '@/hooks/useTheme';
import { Contact } from '@/types/contact';

export default function ContactsTab() {
  const { colors, isDark } = useTheme();
  const {
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
  } = useContacts();

  const [searchQuery, setSearchQuery] = useState(filters.query);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update filters when debounced search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== filters.query) {
      updateFilters({ query: debouncedSearchQuery });
    }
  }, [debouncedSearchQuery, filters.query, updateFilters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const handleContactPress = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleCloseDetails = () => {
    setSelectedContact(null);
  };

  const handleFavoriteToggle = async (contactId: string) => {
    await toggleFavorite(contactId);
    // Update selected contact if it's currently open
    if (selectedContact && selectedContact.id === contactId) {
      setSelectedContact({ 
        ...selectedContact, 
        isFavorite: !selectedContact.isFavorite 
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleSourceFilter = (source: string | undefined) => {
    if (source === 'favorites') {
      updateFilters({ showFavoritesOnly: true, source: undefined });
    } else {
      updateFilters({ showFavoritesOnly: false, source });
    }
  };
  const sources = ['device', 'sim', 'google', 'exchange'];
  const hasMore = contacts.length < filteredContacts.length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={clearSearch}
          onFilterPress={() => setShowFilterModal(true)}
        />
        
        <FilterBar
          filters={filters}
          stats={stats}
          lastSyncTime={lastSyncTime}
          onFilterPress={() => setShowFilterModal(true)}
          onSourceFilter={handleSourceFilter}
        />
        
        <ContactList
          contacts={contacts}
          hasMore={hasMore}
          onContactPress={handleContactPress}
          onFavoriteToggle={handleFavoriteToggle}
          onRefresh={handleRefresh}
          onLoadMore={loadMoreContacts}
          refreshing={refreshing}
          loading={loading}
          loadingMore={loadingMore}
        />

        <FilterModal
          visible={showFilterModal}
          filters={filters}
          onFiltersChange={updateFilters}
          onClose={() => setShowFilterModal(false)}
          sources={sources}
        />

        <ContactDetails
          contact={selectedContact}
          visible={!!selectedContact}
          onClose={handleCloseDetails}
          onFavoriteToggle={() => selectedContact && handleFavoriteToggle(selectedContact.id)}
        />
      </View>
    </SafeAreaView>
  );
}