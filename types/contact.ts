export interface Contact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers: PhoneNumber[];
  emails: Email[];
  addresses: Address[];
  jobTitle?: string;
  company?: string;
  notes?: string;
  source: ContactSource;
  imageUri?: string;
  createdAt: Date;
  modifiedAt: Date;
  tags: string[];
  isFavorite: boolean;
}

export interface PhoneNumber {
  id: string;
  number: string;
  label: string;
  isPrimary?: boolean;
}

export interface Email {
  id: string;
  email: string;
  label: string;
  isPrimary?: boolean;
}

export interface Address {
  id: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  label: string;
}

export interface ContactSource {
  type: 'device' | 'sim' | 'google' | 'exchange' | 'other';
  name: string;
  accountId?: string;
}

export interface SearchFilters {
  query: string;
  source?: string;
  sortBy: 'name' | 'createdAt' | 'modifiedAt';
  sortOrder: 'asc' | 'desc';
  showFavoritesOnly: boolean;
}

export interface ContactStats {
  total: number;
  bySource: Record<string, number>;
  favorites: number;
  withPhotos: number;
}