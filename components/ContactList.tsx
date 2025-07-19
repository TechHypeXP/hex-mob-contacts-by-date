import React, { useCallback } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Contact } from '@/types/contact';
import { ContactItem } from './ContactItem';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  contacts: Contact[];
  onContactPress: (contact: Contact) => void;
  onFavoriteToggle: (contactId: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function ContactList({ contacts, onContactPress, onFavoriteToggle, onRefresh, refreshing }: Props) {
  const { colors } = useTheme();
  const renderItem = useCallback(({ item }: { item: Contact }) => <ContactItem contact={item} onPress={() => onContactPress(item)} onFavoriteToggle={() => onFavoriteToggle(item.id)} />, [onContactPress, onFavoriteToggle]);
  const keyExtractor = (item: Contact) => item.id;
  const getItemLayout = (_: any, index: number) => ({ length: 64, offset: 64 * index, index });
  const styles = getStyles(colors);
  return (
    <FlatList
      data={contacts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No Contacts Found</Text></View>}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      contentContainerStyle={{ paddingBottom: 20 }}
      windowSize={11} initialNumToRender={20}
    />
  );
}
const getStyles = (colors: any) => StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  emptyText: { fontSize: 16, color: colors.textSecondary },
});
