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
    color: white;
  }

  .profile-button__name {
    font-size: 14px;
    color: white;
  }

  .profile-button__avatar {
    width: 28px;
    height: 28px;
    background-color: black;
    border-radius: 50%;
    border: 2px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
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
    background-color: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border-radius: 0.5rem !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    padding: 0.5rem !important;
    z-index: 100 !important;
    /* Ensure it stays within viewport */
    transform-origin: top right !important;
  }

  /* User Info Section */
  .profile-dropdown-info {
    padding: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0.25rem;
  }

  .profile-dropdown-info__name {
    color: white;
    font-size: 14px;
    margin: 0;
    padding: 0;
  }

  .profile-dropdown-info__email {
    color: rgba(255, 255, 255, 0.6);
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
    padding: 0.375rem 0.75rem;
    color: white;
    font-size: 14px;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.15s ease;
    display: block;
  }

  .profile-dropdown-action:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .profile-dropdown-action--signout {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 0.25rem;
    padding-top: 0.5rem;
  }
`;