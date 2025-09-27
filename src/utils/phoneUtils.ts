// Utility function to sanitize phone numbers for WhatsApp links
export const sanitizePhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  return phoneNumber.replace(/\D/g, '');
};