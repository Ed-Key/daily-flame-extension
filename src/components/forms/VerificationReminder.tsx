import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';

interface VerificationReminderProps {
  userEmail: string;
  onClose: () => void;
}

export const VerificationReminder: React.FC<VerificationReminderProps> = ({
  userEmail,
  onClose
}) => {
  const { sendVerificationEmail } = useAuth();
  const { showToast } = useToast();
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await sendVerificationEmail();
      showToast('Verification email sent! Please check your inbox.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to send verification email', 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="p-3 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded text-red-200 text-sm">
      <div>
        <p className="mb-2 text-red-200 text-sm">
          Please verify your email before signing in. Check your inbox for a verification link.
        </p>
        <p className="text-red-200 text-sm">
          Didn't receive an email?{' '}
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className={`text-blue-300 underline bg-transparent border-none text-inherit font-medium p-0 ${isResending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isResending ? 'Sending...' : 'Resend verification link here'}
          </button>
        </p>
        <p className="mt-2 text-red-200 text-opacity-75 text-xs">
          Make sure to check your spam folder. Emails can take a few minutes to arrive.
        </p>
      </div>
    </div>
  );
};