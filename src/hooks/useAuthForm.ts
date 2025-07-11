import { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/ToastContext';

interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
  rememberMe?: boolean;
}

interface AuthResult {
  success: boolean;
  error?: string;
  verificationRequired?: boolean;
  userEmail?: string;
}

export const useAuthForm = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (data: AuthFormData): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      showToast('Successfully signed in!', 'success');
      return { success: true };
    } catch (error: any) {
      // Check if this is a verification error
      if (error.isVerificationError) {
        return { 
          success: false, 
          verificationRequired: true,
          userEmail: error.userEmail 
        };
      }
      return { success: false, error: error.message || 'Failed to sign in' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: AuthFormData): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.firstName, data.lastName);
      
      // Show success message - user needs to verify email
      showToast(
        'Account created! Please check your email to verify your account.',
        'success'
      );
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create account' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      showToast('Successfully signed in with Google!', 'success');
      return { success: true };
    } catch (error: any) {
      // Handle specific Google sign-in errors
      if (error.message?.includes('popup')) {
        return { 
          success: false, 
          error: 'Pop-up was blocked. Please allow pop-ups for this site.' 
        };
      } else if (error.message?.includes('cancelled') || error.message?.includes('closed')) {
        return { 
          success: false, 
          error: 'Sign-in was cancelled.' 
        };
      } else if (error.message?.includes('redirect')) {
        return { 
          success: false, 
          error: 'Authentication redirect failed. Please try again.' 
        };
      }
      return { success: false, error: error.message || 'Google sign-in failed' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSignIn,
    handleSignUp,
    handleGoogleSignIn,
    isLoading
  };
};