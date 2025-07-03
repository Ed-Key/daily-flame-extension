import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useToast } from '../../ToastContext';
import { ProfileDropdownProps } from '../types';

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  isAdmin,
  isEmailVerified,
  onSignOut,
  onClearAuthTokens,
  shadowRoot
}) => {
  const { sendVerificationEmail } = useAuth();
  const { showToast } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Get the event target (shadowRoot or document)
    const eventTarget = shadowRoot || document;

    // Click outside handler
    const handleClickOutside = (event: Event) => {
      if (showDropdown) {
        const target = event.target as Element;
        if (!target.closest('.profile-dropdown')) {
          setShowDropdown(false);
        }
      }
    };

    // Keyboard shortcut for clearing auth tokens (Ctrl+Shift+C)
    const handleKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.ctrlKey && keyboardEvent.shiftKey && keyboardEvent.key === 'C') {
        keyboardEvent.preventDefault();
        onClearAuthTokens();
      }
    };

    eventTarget.addEventListener('click', handleClickOutside);
    eventTarget.addEventListener('keydown', handleKeyDown);

    return () => {
      eventTarget.removeEventListener('click', handleClickOutside);
      eventTarget.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDropdown, shadowRoot, onClearAuthTokens]);

  const getUserInitials = (user: any) => {
    if (user.displayName) {
      return user.displayName.split(' ').map((name: string) => name[0]).join('').toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserAvatar = (user: any) => {
    // For Google users, we might have a photoURL
    if (user.photoURL) {
      return user.photoURL;
    }
    return null;
  };

  const handleSendVerificationEmail = async () => {
    try {
      await sendVerificationEmail();
      showToast('Verification email sent! Please check your inbox.', 'success');
    } catch (error) {
      console.error('Error sending verification email:', error);
      showToast('Failed to send verification email. Please try again.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await onSignOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="relative profile-dropdown">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="df-glassmorphism-element flex items-center gap-2 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors backdrop-blur-sm"
      >
        {getUserAvatar(user) ? (
          <img
            src={getUserAvatar(user)}
            alt="Profile"
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {getUserInitials(user)}
          </div>
        )}
        <span className="text-sm">{user.displayName || user.email?.split('@')[0]}</span>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="df-glassmorphism-dropdown absolute top-12 right-0 w-64 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 p-2 z-20">
          <div className="px-3 py-2 border-b border-white border-opacity-20 mb-2">
            <p className="text-white text-sm font-medium">{user.displayName || 'User'}</p>
            <p className="text-white text-opacity-70 text-xs">{user.email}</p>
            <div className="mt-1 flex gap-2">
              {isAdmin && (
                <span className="inline-block px-2 py-1 bg-green-600 bg-opacity-20 text-green-200 text-xs rounded border border-green-400 border-opacity-50">
                  Admin
                </span>
              )}
              {!isEmailVerified && (
                <span className="inline-block px-2 py-1 bg-yellow-600 bg-opacity-20 text-yellow-200 text-xs rounded border border-yellow-400 border-opacity-50">
                  Unverified
                </span>
              )}
            </div>
          </div>
          
          {/* Email Verification Section */}
          {!isEmailVerified && (
            <button
              onClick={handleSendVerificationEmail}
              className="w-full text-left px-3 py-2 text-white text-sm hover:bg-white hover:bg-opacity-10 rounded transition-colors"
            >
              Resend Verification Email
            </button>
          )}
          
          {/* Clear Auth Tokens */}
          <button
            onClick={onClearAuthTokens}
            className="w-full text-left px-3 py-2 text-white text-sm hover:bg-white hover:bg-opacity-10 rounded transition-colors"
            title="Clear auth tokens to test with different Google accounts"
          >
            Clear Auth Tokens
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-white text-sm hover:bg-white hover:bg-opacity-10 rounded transition-colors border-t border-white border-opacity-20 mt-2 pt-2"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;