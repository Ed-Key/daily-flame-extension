import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { FormInput } from './FormInput';
import { FormPasswordInput } from './FormPasswordInput';
import { FormError } from './FormError';
import { useAuthForm } from '../../hooks/useAuthForm';

interface SignInFormProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onVerificationRequired: (email: string) => void;
}

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onClose,
  onSwitchToSignUp,
  onVerificationRequired
}) => {
  const methods = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const { handleSignIn, handleGoogleSignIn, isLoading } = useAuthForm();
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (data: SignInFormData) => {
    setError(null);
    const result = await handleSignIn(data);
    
    if (result.success) {
      onClose();
    } else if (result.verificationRequired) {
      onVerificationRequired(result.userEmail!);
    } else {
      setError(result.error || 'Failed to sign in');
    }
  };

  const onGoogleSignIn = async () => {
    setError(null);
    const result = await handleGoogleSignIn();
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div className="df-glassmorphism-modal bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg border border-white border-opacity-20 w-80 max-w-sm relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">Sign In</h3>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            ×
          </button>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              name="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              validation={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 5L2 7" />
                </svg>
              }
              autoComplete="email"
            />

            <FormPasswordInput
              name="password"
              label="Password"
              placeholder="Enter your password"
              validation={{
                required: 'Password is required'
              }}
              autoComplete="current-password"
            />
            
            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                {...methods.register('rememberMe')}
                type="checkbox"
                id="rememberMe"
                className="mr-2 rounded"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="text-white text-sm">
                Remember me
              </label>
            </div>
            
            <FormError message={error || undefined} />
            
            <div className="space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded text-sm font-medium border-none transition-colors outline-none bg-blue-600 text-white ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'}`}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded text-sm font-medium border-none transition-colors outline-none bg-white bg-opacity-20 text-white flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-30 cursor-pointer'}`}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </form>
        </FormProvider>
        
        {/* Sign-up link */}
        <div className="mt-4 text-center">
          <p className="text-white text-sm">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-blue-300 hover:text-blue-200 underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};