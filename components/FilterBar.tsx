import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { SearchFilters, ContactStats } from '@/types/contact';
import { useTheme } from '@/hooks/useTheme';
import { ConfigService } from '@/src/config/ConfigService';
import { useContacts } from '@/hooks/useContacts'; // Import the new useContacts hook

interface FilterBarProps {
  onFilterPress: () => void;
  onSourceFilter: (source: string | undefined) => void;
  onAdvancedSearchPress: () => void;
}

export function FilterBar({
  onFilterPress,
  onSourceFilter,
  onAdvancedSearchPress
}: FilterBarProps) {
  const { colors } = useTheme();
  const { filters, stats, lastSyncTime } = useContacts(); // Get filters, stats, lastSyncTime from context
  const enableAdvancedSearch = ConfigService.get<boolean>('features.advancedSearch');

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const sources = useMemo(() => [
    { 
      key: 'all', 
      label: 'All', 
      count: stats.total,
      lastUpdated: lastSyncTime,
    },
    { 
      key: 'device', 
      label: 'Device', 
      count: stats.bySource.device || 0,
      lastUpdated: lastSyncTime,
    },
    { 
      key: 'sim', 
      label: 'SIM', 
      count: stats.bySource.sim || 0,
      lastUpdated: lastSyncTime,
    },
    { 
      key: 'google', 
      label: 'Google', 
      count: stats.bySource.google || 0,
      lastUpdated: lastSyncTime,
    },
    { 
      key: 'exchange', 
      label: 'Exchange', 
      count: stats.bySource.exchange || 0,
      lastUpdated: lastSyncTime,
    },
    { 
      key: 'favorites', 
      label: 'Favorites', 
      count: stats.favorites,
      lastUpdated: lastSyncTime,
    },
  ], [stats, lastSyncTime]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    scrollContainer: {
      paddingHorizontal: 12,
    },
    filterChip: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 6,
      borderRadius: 16,
      backgroundColor: colors.surfaceVariant,
      minWidth: 65,
    },
    activeFilterChip: {
      backgroundColor: colors.primary,
    },
    filterLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 1,
    },
    activeFilterLabel: {
      color: '#FFFFFF',
    },
    filterCount: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.primary,
    },
    activeFilterCount: {
      color: '#FFFFFF',
    },
    filterTime: {
      fontSize: 9,
      color: colors.textTertiary,
      marginTop: 1,
    },
    activeFilterTime: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    moreFiltersButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.surfaceVariant,
      marginLeft: 6,
    },
    moreFiltersText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: 4,
    },
  });

  const isActive = (sourceKey: string) => {
    if (sourceKey === 'all') return !filters.source && !filters.showFavoritesOnly;
    if (sourceKey === 'favorites') return filters.showFavoritesOnly;
    return filters.source === sourceKey;
  };

  const handleSourcePress = (sourceKey: string) => {
    if (sourceKey === 'all') {
      onSourceFilter(undefined);
    } else if (sourceKey === 'favorites') {
      onSourceFilter('favorites');
    } else {
      onSourceFilter(sourceKey);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {sources.map((source) => {
          const active = isActive(source.key);
          return (
            <TouchableOpacity
              key={source.key}
              style={[
                styles.filterChip,
                active && styles.activeFilterChip,
              ]}
              onPress={() => handleSourcePress(source.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterLabel,
                active && styles.activeFilterLabel,
              ]}>
                {source.label}
              </Text>
              <Text style={[
                styles.filterCount,
                active && styles.activeFilterCount,
              ]}>
                {source.count.toLocaleString()}
              </Text>
              <Text style={[
                styles.filterTime,
                active && styles.activeFilterTime,
              ]}>
                {formatLastSync(source.lastUpdated)}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {enableAdvancedSearch && (
          <TouchableOpacity
            style={styles.moreFiltersButton}
            onPress={onAdvancedSearchPress}
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={14} color={colors.primary} />
            <Text style={styles.moreFiltersText}>Advanced Search</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.moreFiltersButton}
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={14} color={colors.primary} />
          <Text style={styles.moreFiltersText}>More Filters</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
