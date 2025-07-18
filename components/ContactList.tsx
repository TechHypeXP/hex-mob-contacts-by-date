import React, { useMemo, useCallback } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Contact } from '@/types/contact';
import { ContactItem } from './ContactItem';
import { useTheme } from '@/hooks/useTheme';
import { ConfigService } from '@/src/config/ConfigService';
import { useContacts } from '@/hooks/useContacts'; // Import the new useContacts hook

interface ContactListProps {
  onContactPress: (contact: Contact) => void;
  onFavoriteToggle: (contactId: string) => void;
}

export function ContactList({
  onContactPress,
  onFavoriteToggle,
}: ContactListProps) {
  const { colors } = useTheme();
  const {
    contacts,
    hasMore,
    loadMoreContacts,
    refreshContacts,
    loading,
    loadingMore,
    refreshing, // Assuming refreshing is also provided by the context
  } = useContacts();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 16,
    },
    loadingMoreContainer: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    loadingMoreText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
    },
  });

  const renderContact = useCallback(({ item }: { item: Contact }) => (
    <ContactItem
      contact={item}
      onPress={() => onContactPress(item)}
      onFavoriteToggle={() => onFavoriteToggle(item.id)}
    />
  ), [onContactPress, onFavoriteToggle]);

  const renderFooter = useCallback(() => {
    if (!loadingMore || !hasMore) return null;
    
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingMoreText}>Loading more contacts...</Text>
      </View>
    );
  }, [loadingMore, hasMore, colors.primary, colors.textSecondary]);
  const keyExtractor = (item: Contact) => item.id;

  const getItemLayout = (_: any, index: number) => ({
    length: ConfigService.get<number>('ui.layout.listItemHeight'),
    offset: ConfigService.get<number>('ui.layout.listItemHeight') * index,
    index,
  });

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadMoreContacts();
    }
  }, [hasMore, loadingMore, loadMoreContacts]);
  
  if (loading && contacts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  if (contacts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No contacts found</Text>
        <Text style={styles.emptySubtext}>
          Try adjusting your search or import contacts from your device
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        windowSize={ConfigService.get<number>('performance.virtualization.windowSize')}
        initialNumToRender={ConfigService.get<number>('performance.virtualization.initialNumToRender')}
        maxToRenderPerBatch={ConfigService.get<number>('performance.virtualization.maxToRenderPerBatch')}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshContacts}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4 }}
      />
    </View>
  );
}
