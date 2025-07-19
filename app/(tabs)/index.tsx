import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, ActivityIndicator } from 'react-native';
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
  const { colors } = useTheme();
  const { filteredContacts, loading, refreshing, error, filters, stats, toggleFavorite, updateFilters, refreshContacts, hasPermissions } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => { updateFilters({ query: debouncedSearchQuery }); }, [debouncedSearchQuery, updateFilters]);

  const handleSourceFilter = (source: string | undefined) => {
    updateFilters({ showFavoritesOnly: source === 'favorites', source: source !== 'favorites' ? (source === 'all' ? undefined : source) : undefined });
  };

  const styles = getStyles(colors);

  const renderContent = () => {
    if (loading) return <View style={styles.centerContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
    if (error) return <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></View>;
    if (!hasPermissions) return <View style={styles.centerContainer}><Text>Permissions needed.</Text></View>;
    return (
      <>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} onClear={() => setSearchQuery('')} onFilterPress={() => setShowFilterModal(true)} />
        <FilterBar activeSource={filters.source} onFilterPress={() => setShowFilterModal(true)} onSourceFilter={handleSourceFilter} />
        <ContactList contacts={filteredContacts} onContactPress={setSelectedContact} onFavoriteToggle={toggleFavorite} onRefresh={refreshContacts} refreshing={refreshing} />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>
      <FilterModal visible={showFilterModal} filters={filters} onFiltersChange={updateFilters} onClose={() => setShowFilterModal(false)} sources={Object.keys(stats.bySource)} />
      {selectedContact && <ContactDetails contact={selectedContact} visible={!!selectedContact} onClose={() => setSelectedContact(null)} onFavoriteToggle={() => toggleFavorite(selectedContact.id)} />}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingBottom: 65 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: colors.error, fontSize: 16, textAlign: 'center' },
});