export const profileDropdownStyles = `
  /* Profile Dropdown Container */
  .profile-dropdown {
    position: relative !important;
    z-index: 21 !important; /* Above the container but within modal */
  }

  /* Profile Button (Trigger) */
  .profile-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--profile-text);
  }

  .profile-button:focus {
    outline: none;
  }

  .profile-button__name {
    font-size: 14px;
    color: var(--profile-text);
  }

  .profile-button__avatar {
    width: 28px;
    height: 28px;
    background-color: var(--avatar-bg);
    border-radius: 50%;
    border: 2px solid var(--avatar-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--avatar-text);
    font-size: 14px;
    font-weight: 600;
    box-sizing: border-box;
  }

  /* Dropdown Menu */
  .profile-dropdown-menu {
    position: absolute !important;
    top: 100% !important;
    right: 0 !important;
    margin-top: 0.5rem !important;
    max-height: 80vh !important;
    overflow-y: auto !important;
    background-color: var(--profile-menu-bg) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border-radius: 0.5rem !important;
    border: 1px solid var(--profile-menu-border) !important;
    padding: 0.5rem 0 !important; /* Only vertical padding on container */
    z-index: 100 !important;
    /* Ensure it stays within viewport */
    transform-origin: top right !important;
  }

  /* User Info Section */
  .profile-dropdown-info {
    padding: 0.75rem 1rem; /* Consistent horizontal padding with buttons */
    border-bottom: 1px solid var(--profile-menu-divider);
    margin-bottom: 0.25rem;
  }

  .profile-dropdown-info__name {
    color: var(--profile-text);
    font-size: 14px;
    margin: 0;
    padding: 0;
  }

  .profile-dropdown-info__email {
    color: var(--profile-email);
    font-size: 12px;
    margin: 0;
    margin-top: 0.125rem;
    padding: 0;
  }

  /* Badges Container */
  .profile-dropdown-badges {
    margin-top: 0.375rem;
    display: flex;
    gap: 0.375rem;
  }

  .profile-dropdown-badge {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    font-size: 12px;
    border-radius: 0.25rem;
  }

  .profile-dropdown-badge--admin {
    color: #86efac;
  }

  .profile-dropdown-badge--unverified {
    color: #fde047;
  }

  /* Dropdown Action Buttons */
  .profile-dropdown-action {
    width: 100%;
    text-align: left;
    padding: 0.5rem 1rem; /* Increased padding to match info section */
    padding-left: 20px !important; /* Override global button padding */
    color: var(--profile-text) !important;
    font-size: 14px;
    background: transparent;
    border: none;
    border-radius: 0;
    cursor: pointer;
    transition: background-color 0.15s ease;
    display: block;
  }

  .profile-dropdown-action:hover {
    background-color: var(--profile-menu-hover);
  }

  .profile-dropdown-action--signout {
    border-top: 1px solid var(--profile-menu-divider);
    margin-top: 0.25rem;
    padding-top: 0.75rem; /* Adjusted to maintain consistent spacing */
  }

  /* Settings button with icon */
  .profile-dropdown-action--settings {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 0.5rem 1rem !important;
  }

  /* Icon styling */
  .profile-dropdown-icon {
    width: 18px !important;
    height: 18px !important;
    flex-shrink: 0 !important;
    stroke: currentColor !important;
    fill: none !important;
    opacity: 0.8 !important;
    transition: opacity 0.15s ease !important;
  }

  .profile-dropdown-action:hover .profile-dropdown-icon {
    opacity: 1 !important;
  }
`;