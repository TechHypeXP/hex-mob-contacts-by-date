import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useContacts } from '@/hooks/useContacts';

interface Props { activeSource?: string; onFilterPress: () => void; onSourceFilter: (source: string | undefined) => void; }

export function FilterBar({ onFilterPress, onSourceFilter }: Props) {
    const { colors } = useTheme();
    const { stats, filters } = useContacts();
    const filterSources = [
        { key: 'all', label: 'All', count: stats.total },
        ...Object.keys(stats.bySource).map(key => ({ key, label: key, count: stats.bySource[key] })),
        { key: 'favorites', label: 'Favorites', count: stats.favorites },
    ];
    const styles = getStyles(colors);
    return (
        <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {filterSources.map(({ key, label, count }) => {
                const isActive = (filters.showFavoritesOnly && key === 'favorites') || (!filters.showFavoritesOnly && (filters.source === key || (!filters.source && key === 'all')));
                return (
                    <TouchableOpacity key={key} style={[styles.chip, isActive && styles.activeChip]} onPress={() => onSourceFilter(key)} activeOpacity={0.7}>
                        <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
                        <Text style={[styles.count, isActive && styles.activeCount]}>{count}</Text>
                    </TouchableOpacity>
                );
            })}
            <TouchableOpacity style={[styles.chip, styles.moreChip]} onPress={onFilterPress} activeOpacity={0.7}>
                <SlidersHorizontal size={16} color={colors.primary} />
            </TouchableOpacity>
        </ScrollView>
        </View>
    );
}
const getStyles = (colors: any) => StyleSheet.create({
    container: { backgroundColor: colors.surface, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.outline },
    scroll: { paddingHorizontal: 16, alignItems: 'center' },
    chip: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, marginRight: 8, borderRadius: 20, backgroundColor: colors.surfaceVariant },
    activeChip: { backgroundColor: colors.primary },
    label: { fontSize: 12, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
    activeLabel: { color: '#FFFFFF' },
    count: { fontSize: 11, color: colors.textSecondary },
    activeCount: { color: 'rgba(255, 255, 255, 0.8)' },
    moreChip: { paddingHorizontal: 12, marginLeft: 4 },
});
