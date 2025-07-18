import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ContactStats } from '@/types/contact';
import { useTheme } from '@/hooks/useTheme';
import { Users, Heart, Image, Database } from 'lucide-react-native';

interface StatsCardProps {
  stats: ContactStats;
}

export function StatsCard({ stats }: StatsCardProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statItem: {
      width: '48%',
      alignItems: 'center',
      paddingVertical: 8,
      marginBottom: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
  });

  const statItems = [
    {
      icon: <Users size={20} color={colors.primary} />,
      value: stats.total.toLocaleString(),
      label: 'Total Contacts',
    },
    {
      icon: <Heart size={20} color={colors.error} />,
      value: stats.favorites.toLocaleString(),
      label: 'Favorites',
    },
    {
      icon: <Image size={20} color={colors.secondary} />,
      value: stats.withPhotos.toLocaleString(),
      label: 'With Photos',
    },
    {
      icon: <Database size={20} color={colors.accent} />,
      value: Object.keys(stats.bySource).length.toString(),
      label: 'Sources',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Statistics</Text>
      <View style={styles.grid}>
        {statItems.map((item, index) => (
          <View key={index} style={styles.statItem}>
            {item.icon}
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}