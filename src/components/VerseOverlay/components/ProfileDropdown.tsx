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
        // Close if clicking outside the dropdown menu AND the button
        if (!target.closest('.profile-dropdown-menu') && !target.closest('.profile-button')) {
          setShowDropdown(false);
        }
      }
    };

    // Listen for other dropdowns opening
    const handleCloseDropdown = (event: CustomEvent) => {
      if (event.detail.source !== 'profile') {
        setShowDropdown(false);
      }
    };

    // Use capture phase to catch clicks before they bubble
    eventTarget.addEventListener('click', handleClickOutside, true);
    document.addEventListener('dropdown-open', handleCloseDropdown as EventListener);

    return () => {
      eventTarget.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('dropdown-open', handleCloseDropdown as EventListener);
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
    <div className="profile-dropdown">
      <button
        onClick={() => {
          const newState = !showDropdown;
          setShowDropdown(newState);
          if (newState) {
            // Notify other dropdowns to close
            document.dispatchEvent(new CustomEvent('dropdown-open', { 
              detail: { source: 'profile' } 
            }));
          }
        }}
        className="profile-button sign-in-glow"
        aria-label="User menu"
      >
        <span className="profile-button__name">{getFormattedName(user)}</span>
        <div className="profile-button__avatar">
          {getFirstInitial(user)}
        </div>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-info">
            <p className="profile-dropdown-info__name">{user.displayName || user.email?.split('@')[0]}</p>
            <p className="profile-dropdown-info__email">{user.email}</p>
            {(isAdmin || !isEmailVerified) && (
              <div className="profile-dropdown-badges">
                {isAdmin && (
                  <span className="profile-dropdown-badge profile-dropdown-badge--admin">
                    Admin
                  </span>
                )}
                {!isEmailVerified && (
                  <span className="profile-dropdown-badge profile-dropdown-badge--unverified">
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
              className="profile-dropdown-action"
            >
              Resend Verification Email
            </button>
          )}
          
          
          <button
            onClick={handleLogout}
            className="profile-dropdown-action profile-dropdown-action--signout"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;