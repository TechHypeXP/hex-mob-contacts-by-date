import React, { useMemo, useCallback } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Contact } from '@/types/contact';
import { ContactItem } from './ContactItem';
import { useTheme } from '@/hooks/useTheme';

interface ContactListProps {
  contacts: Contact[];
  hasMore: boolean;
  onContactPress: (contact: Contact) => void;
  onFavoriteToggle: (contactId: string) => void;
  onRefresh: () => void;
  onLoadMore: () => void;
  refreshing: boolean;
  loading: boolean;
  loadingMore: boolean;
}

export function ContactList({ 
  contacts, 
  hasMore,
  onContactPress, 
  onFavoriteToggle, 
  onRefresh,
  onLoadMore,
  refreshing,
  loading,
  loadingMore,
}: ContactListProps) {
  const { colors } = useTheme();

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
      compact={true}
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
    length: 72, // Compact item height
    offset: 72 * index,
    index,
  });

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore]);
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        updateCellsBatchingPeriod={50}
        initialNumToRender={25}
        windowSize={15}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
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