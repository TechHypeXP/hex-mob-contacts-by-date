import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import {
  X,
  Phone,
  Mail,
  MessageCircle as SMS,
  MapPin,
  Building2,
  Calendar,
  Heart,
  ExternalLink,
  MessageCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { Contact } from '@/types/contact';
import { useTheme } from '@/hooks/useTheme';

const formatDate = (date: Date) => {
    if (!date || date.getFullYear() <= 1980) return 'Not available';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    }).format(date);
};

interface ContactDetailsProps {
  contact: Contact | null;
  visible: boolean;
  onClose: () => void;
  onFavoriteToggle: () => void;
}

export function ContactDetails({ contact, visible, onClose, onFavoriteToggle }: { contact: Contact | null, visible: boolean, onClose: () => void, onFavoriteToggle: () => void }) {
    const { colors } = useTheme();

    if (!contact) return null;

    const handleLink = (url: string) => Linking.canOpenURL(url).then(canOpen => canOpen && Linking.openURL(url));
    const getInitials = (name: string) => name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);

    const styles = getStyles(colors);

    const DetailSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    const InfoRow = ({ icon: Icon, value, label, actions = [] }: { icon: any, value: string, label?: string, actions?: { icon: any, onPress: () => void, color?: string }[] }) => (
        <View style={styles.itemRow}>
            <Icon size={20} color={colors.primary} style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
                <Text style={styles.itemValue}>{value}</Text>
                {label && <Text style={styles.itemLabel}>{label}</Text>}
            </View>
            <View style={{ flexDirection: 'row' }}>
              {actions.map((action, index) => (
                  <TouchableOpacity key={index} style={{ paddingHorizontal: 8 }} onPress={action.onPress}>
                      <action.icon size={20} color={action.color || colors.primary} />
                  </TouchableOpacity>
              ))}
            </View>
        </View>
    );

    return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Contact Details</Text>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={{ padding: 8 }} onPress={onFavoriteToggle}>
                    <Heart size={24} color={contact.isFavorite ? colors.error : colors.textSecondary} fill={contact.isFavorite ? colors.error : 'transparent'}
/>
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 8, marginLeft: 8 }} onPress={onClose}>
                    <X size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
        </View>
        <ScrollView>
            <View style={styles.profileSection}>

                <View style={styles.avatar}>
                    {contact.imageUri ? <Image source={{ uri: contact.imageUri }} style={styles.avatarImage} /> : <Text
style={styles.avatarText}>{getInitials(contact.name)}</Text>}
                </View>
                <Text style={styles.name}>{contact.name}</Text>
                <Text style={styles.jobTitle}>{(contact.jobTitle || 'No job title')} at {(contact.company || 'No company')}</Text>
            </View>

            {contact.phoneNumbers.length > 0 && (
                <DetailSection title="Phone">
                    {contact.phoneNumbers.map((p, i) => <InfoRow key={i} icon={Phone} value={p.number} label={p.label} actions={[
                        { icon: Phone, onPress: () => handleLink(`tel:${p.number}`) },
                        { icon: MessageCircle, color: colors.success, onPress: () => Linking.openURL(`whatsapp://send?phone=${p.number.replace(/[^\d+]/g, '')}`) },
                        { icon: SMS, color: colors.primary, onPress: () => handleLink(`sms:${p.number}`) },
                    ]} />)}
                </DetailSection>
            )}

            {contact.emails.length > 0 && (
                <DetailSection title="Email">
                    {contact.emails.map((e, i) => <InfoRow key={i} icon={Mail} value={e.email} label={e.label} actions={[
                        { icon: Mail, onPress: () => handleLink(`mailto:${e.email}`) }
                    ]} />)}
                </DetailSection>
            )}

            <DetailSection title="Information">
                <InfoRow icon={Building2} value={`Source: ${contact.source.name || 'Unknown'}`} />
                <InfoRow icon={Calendar} value={`Created: ${formatDate(contact.createdAt)}`} />
                <InfoRow icon={Calendar} value={`Modified: ${formatDate(contact.modifiedAt)}`} />
            </DetailSection>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.outline, marginHorizontal: 16 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
    profileSection: { alignItems: 'center', padding: 24, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outline },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    avatarImage: { width: 80, height: 80, borderRadius: 40 },
    avatarText: { fontSize: 24, fontWeight: '600', color: colors.primary },
    name: { fontSize: 24, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: 4 },
    jobTitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
    section: { backgroundColor: colors.surface, marginTop: 8, paddingVertical: 8 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, paddingHorizontal: 16, paddingVertical: 8, textTransform: 'uppercase' },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.outline },
    itemValue: { fontSize: 16, color: colors.text, marginBottom: 2 },
    itemLabel: { fontSize: 14, color: colors.textSecondary, textTransform: 'capitalize' },
});