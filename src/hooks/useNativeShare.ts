import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { sanitizePhoneNumber } from '@/utils/phoneUtils';

export const useNativeShare = () => {
  const sharePost = async (post: {
    id: string;
    type: string;
    title: string;
    description?: string;
    contactPhone?: string;
    contactWhatsapp?: string;
    contactEmail?: string;
  }) => {
    const postUrl = `${window.location.origin}/post/${post.type}/${post.id}`;
    
    let shareText = `${post.title}\n\n`;
    if (post.description) {
      shareText += `${post.description}\n\n`;
    }
    
    shareText += `Ver más detalles: ${postUrl}\n\n`;
    
    // Add contact information
    if (post.contactWhatsapp) {
      const cleanPhone = sanitizePhoneNumber(post.contactWhatsapp);
      shareText += `WhatsApp: https://wa.me/${cleanPhone}\n`;
    }
    if (post.contactPhone) {
      shareText += `Teléfono: ${post.contactPhone}\n`;
    }
    if (post.contactEmail) {
      shareText += `Email: ${post.contactEmail}\n`;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        // Use native share dialog
        await Share.share({
          title: post.title,
          text: shareText,
          url: postUrl,
          dialogTitle: 'Compartir publicación',
        });
      } else {
        // Web fallback - use Web Share API if available
        if (navigator.share) {
          await navigator.share({
            title: post.title,
            text: shareText,
            url: postUrl,
          });
        } else {
          // Fallback - copy to clipboard
          await navigator.clipboard.writeText(shareText);
          // You might want to show a toast here
          console.log('Link copied to clipboard');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        console.log('Link copied to clipboard as fallback');
      } catch (clipboardError) {
        console.error('Clipboard fallback failed:', clipboardError);
      }
    }
  };

  const shareToWhatsApp = async (post: {
    id: string;
    type: string;
    title: string;
    description?: string;
    contactPhone?: string;
  }) => {
    const postUrl = `${window.location.origin}/post/${post.type}/${post.id}`;
    let message = `${post.title}\n\n`;
    
    if (post.description) {
      message += `${post.description}\n\n`;
    }
    
    message += `Ver más: ${postUrl}`;
    
    if (post.contactPhone) {
      message += `\nContacto: ${post.contactPhone}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    if (Capacitor.isNativePlatform()) {
      window.open(whatsappUrl, '_system');
    } else {
      window.open(whatsappUrl, '_blank');
    }
  };

  return {
    sharePost,
    shareToWhatsApp,
  };
};