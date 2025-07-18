import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { Phone, Heart, Clock } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { Contact } from '@/types/contact';
import { useTheme } from '@/hooks/useTheme';

interface ContactItemProps {
  contact: Contact;
  onPress: () => void;
  onFavoriteToggle: () => void;
  compact?: boolean;
}

export function ContactItem({ contact, onPress, onFavoriteToggle, compact = true }: ContactItemProps) {
  const { colors } = useTheme();

  const handleCall = async (phoneNumber: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const url = `tel:${phoneNumber}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const handleFavoriteToggle = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onFavoriteToggle();
  };

  const primaryPhone = contact.phoneNumbers.find(p => p.isPrimary) || contact.phoneNumbers[0];
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 2,
      borderRadius: 12,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    content: {
      padding: compact ? 12 : 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: compact ? 40 : 48,
      height: compact ? 40 : 48,
      borderRadius: compact ? 20 : 24,
      backgroundColor: colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarImage: {
      width: compact ? 40 : 48,
      height: compact ? 40 : 48,
      borderRadius: compact ? 20 : 24,
    },
    avatarText: {
      fontSize: compact ? 16 : 18,
      fontWeight: '600',
      color: colors.primary,
    },
    nameContainer: {
      flex: 1,
    },
    name: {
      fontSize: compact ? 15 : 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: compact ? 1 : 2,
    },
    subtitle: {
      fontSize: compact ? 12 : 14,
      color: colors.textSecondary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    phoneNumber: {
      fontSize: compact ? 12 : 14,
      color: colors.textSecondary,
      marginRight: 8,
    },
    lastModified: {
      fontSize: compact ? 11 : 12,
      color: colors.textTertiary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    callButton: {
      padding: 8,
      marginRight: 4,
    },
    favoriteButton: {
      padding: 8,
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    separator: {
      color: colors.textTertiary,
      marginHorizontal: 4,
      fontSize: 10,
    },
    clockIcon: {
      marginRight: 4,
    },
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            {contact.imageUri ? (
              <Image source={{ uri: contact.imageUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
            )}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{contact.name}</Text>
            <View style={styles.subtitleRow}>
              {primaryPhone && (
                <Text style={styles.phoneNumber}>{primaryPhone.number}</Text>
              )}
              {primaryPhone && (
                <Text style={styles.separator}>•</Text>
              )}
              <View style={styles.lastModified}>
                <Clock size={10} color={colors.textTertiary} style={styles.clockIcon} />
                <Text style={styles.lastModified}>{formatDate(contact.modifiedAt)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.actionContainer}>
            {primaryPhone && (
              <TouchableOpacity 
                style={styles.callButton} 
                onPress={() => handleCall(primaryPhone.number)}
                activeOpacity={0.7}
              >
                <Phone size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.favoriteButton} 
              onPress={handleFavoriteToggle}
              activeOpacity={0.7}
            >
              <Heart 
                size={18} 
                color={contact.isFavorite ? colors.error : colors.textTertiary}
                fill={contact.isFavorite ? colors.error : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}