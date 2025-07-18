import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SlidersHorizontal, Users, Clock } from 'lucide-react-native';
import { SearchFilters, ContactStats } from '@/types/contact';
import { useTheme } from '@/hooks/useTheme';

interface FilterBarProps {
  filters: SearchFilters;
  stats: ContactStats;
  lastSyncTime: Date | null;
  onFilterPress: () => void;
  onSourceFilter: (source: string | undefined) => void;
}

export function FilterBar({ 
  filters, 
  stats, 
  lastSyncTime,
  onFilterPress, 
  onSourceFilter 
}: FilterBarProps) {
  const { colors } = useTheme();

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

  const getLatestContactDate = (sourceType: string) => {
    // Return the most recent modification date for contacts from this source
    // For now, using lastSyncTime as approximation
    return lastSyncTime;
  };

  const sources = [
    { 
      key: 'all', 
      label: 'All', 
      count: stats.total,
      lastUpdated: getLatestContactDate('all'),
    },
    { 
      key: 'device', 
      label: 'Device', 
      count: stats.bySource.device || 0,
      lastUpdated: getLatestContactDate('device'),
    },
    { 
      key: 'favorites', 
      label: 'Favorites', 
      count: stats.favorites,
      lastUpdated: getLatestContactDate('favorites'),
    },
  ];

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
      paddingHorizontal: 16,
    },
    filterChip: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: colors.surfaceVariant,
      minWidth: 75,
    },
    activeFilterChip: {
      backgroundColor: colors.primary,
    },
    filterLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 1,
    },
    activeFilterLabel: {
      color: '#FFFFFF',
    },
    filterCount: {
      fontSize: 13,
      fontWeight: 'bold',
      color: colors.primary,
    },
    activeFilterCount: {
      color: '#FFFFFF',
    },
    filterTime: {
      fontSize: 10,
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
      borderRadius: 20,
      backgroundColor: colors.surfaceVariant,
      marginLeft: 8,
    },
    moreFiltersText: {
      fontSize: 12,
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
      onSourceFilter(undefined);
      // This would trigger the favorites filter
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
        
        <TouchableOpacity
          style={styles.moreFiltersButton}
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={16} color={colors.primary} />
          <Text style={styles.moreFiltersText}>More</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}