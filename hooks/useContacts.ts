import { useContacts as useContactsFromContext } from '@/src/context/ContactContext';

export function useContacts() {
  return useContactsFromContext();
}
