import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useToast } from '../../ToastContext';
import { ProfileDropdownProps } from '../types';

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  isAdmin,
  isEmailVerified,
  onSignOut,
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


    eventTarget.addEventListener('click', handleClickOutside);

    return () => {
      eventTarget.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown, shadowRoot]);

  // Helper function to format user name (e.g., "Edward Kiboma" → "Edward K.")
  const getFormattedName = (user: any) => {
    if (user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0]} ${names[1][0]}.`;
      }
      return names[0];
    }
    // Fallback to email username
    return user.email?.split('@')[0] || 'User';
  };

  // Helper function to get first initial
  const getFirstInitial = (user: any) => {
    if (user.displayName) {
      return user.displayName[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
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
        className="flex items-center gap-2 text-white sign-in-glow"
        aria-label="User menu"
      >
        <span className="text-sm">{getFormattedName(user)}</span>
        <div 
          className="bg-black rounded-full flex items-center justify-center text-white text-sm font-semibold box-border"
          style={{ width: '28px', height: '28px', border: '2px solid white' }}
        >
          {getFirstInitial(user)}
        </div>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-12 right-0 w-56 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 p-2 z-20">
          <div className="px-3 py-2 border-b border-white border-opacity-10 mb-1">
            <p className="text-white text-sm">{user.displayName || user.email?.split('@')[0]}</p>
            <p className="text-white text-opacity-60 text-xs mt-0.5">{user.email}</p>
            {(isAdmin || !isEmailVerified) && (
              <div className="mt-1.5 flex gap-1.5">
                {isAdmin && (
                  <span className="inline-block px-1.5 py-0.5 text-green-300 text-xs rounded">
                    Admin
                  </span>
                )}
                {!isEmailVerified && (
                  <span className="inline-block px-1.5 py-0.5 text-yellow-300 text-xs rounded">
                    Unverified
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Email Verification Section */}
          {!isEmailVerified && (
            <button
              onClick={handleSendVerificationEmail}
              className="w-full text-left px-3 py-1.5 text-white text-sm hover:bg-white hover:bg-opacity-10 rounded transition-opacity"
            >
              Resend Verification Email
            </button>
          )}
          
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-1.5 text-white text-sm hover:bg-white hover:bg-opacity-10 rounded transition-opacity border-t border-white border-opacity-10 mt-1 pt-1"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;