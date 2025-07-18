import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X, Filter } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFilterPress: () => void;
  placeholder?: string;
}

export function SearchBar({ 
  value, 
  onChangeText, 
  onClear, 
  onFilterPress,
  placeholder = 'Search contacts...' 
}: SearchBarProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      paddingHorizontal: 12,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    searchIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      height: 48,
      fontSize: 16,
      color: colors.text,
    },
    clearButton: {
      padding: 4,
      marginLeft: 8,
    },
    filterButton: {
      padding: 8,
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.container}>
      <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={onClear} activeOpacity={0.7}>
          <X size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress} activeOpacity={0.7}>
        <Filter size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}