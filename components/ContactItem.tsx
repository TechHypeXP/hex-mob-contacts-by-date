import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Phone, Heart, MessageCircle } from 'lucide-react-native'; // Import MessageCircle
import * as Linking from 'expo-linking';
import { Contact } from '@/types/contact';
import { useTheme } from '@/hooks/useTheme';

// REPAIRED DATE FORMATTING
const formatDate = (date: Date) => {
    if (!date || date.getFullYear() <= 1980) return ''; // Don't show invalid dates
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
};

interface ContactItemProps {
  contact: Contact;
  onPress: (contact: Contact) => void;
  onFavoriteToggle: (contactId: string) => void;
}

export function ContactItem({ contact, onPress, onFavoriteToggle }: ContactItemProps) {
  const { colors } = useTheme();
  const primaryPhone = contact.phoneNumbers.find(p => p.isPrimary) || contact.phoneNumbers[0];

  // RESTORED WHATSAPP FUNCTIONALITY
  const handleWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    Linking.openURL(`whatsapp://send?phone=${cleanNumber}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(contact)} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        {contact.imageUri ? (
          <Image source={{ uri: contact.imageUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {contact.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]}>{contact.name}</Text>
        {primaryPhone && (
          <Text style={[styles.phone, { color: colors.textSecondary }]}>
            {primaryPhone.number}
          </Text>
        )}
        <Text style={[styles.date, { color: colors.textTertiary }]}>
          {formatDate(contact.modifiedAt)}
        </Text>
      </View>
      <View style={styles.actions}>
        {primaryPhone && (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL(`tel:${primaryPhone.number}`)}>
              <Phone size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleWhatsApp(primaryPhone.number)}>
              <MessageCircle size={18} color={colors.success} />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={() => onFavoriteToggle(contact.id)}>
          <Heart size={18} color={contact.isFavorite ? colors.accent : colors.textTertiary} fill={contact.isFavorite ? colors.accent : 'none'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // This should be dynamic from colors.outline
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  phone: {
    fontSize: 13,
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
});
