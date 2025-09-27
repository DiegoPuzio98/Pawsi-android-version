import { useState } from 'react';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export const useNativeAuth = () => {
  const [loading, setLoading] = useState(false);

  const initializeGoogleAuth = async () => {
    if (Capacitor.isNativePlatform()) {
      await GoogleAuth.initialize({
        clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      if (!Capacitor.isNativePlatform()) {
        throw new Error('Google Sign-In is only available on native platforms');
      }

      await initializeGoogleAuth();
      
      const result = await GoogleAuth.signIn();
      
      if (!result.authentication?.idToken) {
        throw new Error('No ID token received from Google');
      }

      // Use the Google ID token to authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: result.authentication.idToken,
        access_token: result.authentication.accessToken,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOutFromGoogle = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.signOut();
      }
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    signInWithGoogle,
    signOutFromGoogle,
    loading,
  };
};