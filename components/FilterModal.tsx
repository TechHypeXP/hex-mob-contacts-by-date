import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { SearchFilters } from '@/types/contact';
import { useTheme } from '@/hooks/useTheme';

interface FilterModalProps {
  visible: boolean;
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClose: () => void;
  sources: string[];
}

export function FilterModal({ 
  visible, 
  filters, 
  onFiltersChange, 
  onClose, 
  sources 
}: FilterModalProps) {
  const { colors } = useTheme();

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'createdAt', label: 'Date Added' },
    { value: 'modifiedAt', label: 'Last Modified' },
  ] as const;

  const orderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ] as const;

  const sourceOptions = [
    { value: 'all', label: 'All Sources' },
    ...sources.map(source => ({ value: source, label: source })),
  ];

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    selectedOption: {
      backgroundColor: colors.surfaceVariant,
    },
    optionText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    switchLabel: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.outline,
    },
    resetButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
      backgroundColor: colors.surfaceVariant,
    },
    applyButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    resetButtonText: {
      color: colors.text,
    },
    applyButtonText: {
      color: '#FFFFFF',
    },
  });

  const resetFilters = () => {
    onFiltersChange({
      source: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
      showFavoritesOnly: false,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter & Sort</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    filters.sortBy === option.value && styles.selectedOption,
                  ]}
                  onPress={() => onFiltersChange({ sortBy: option.value })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {filters.sortBy === option.value && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort Order</Text>
              {orderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    filters.sortOrder === option.value && styles.selectedOption,
                  ]}
                  onPress={() => onFiltersChange({ sortOrder: option.value })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {filters.sortOrder === option.value && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Source</Text>
              {sourceOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    (filters.source || 'all') === option.value && styles.selectedOption,
                  ]}
                  onPress={() => onFiltersChange({ 
                    source: option.value === 'all' ? undefined : option.value 
                  })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {(filters.source || 'all') === option.value && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Show favorites only</Text>
                <Switch
                  value={filters.showFavoritesOnly}
                  onValueChange={(value) => onFiltersChange({ showFavoritesOnly: value })}
                  trackColor={{ false: colors.outline, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.resetButtonText]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.applyButtonText]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}