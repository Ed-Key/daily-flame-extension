export const themeToggleStyles = `
  /* Theme Toggle Container */
  .theme-toggle {
    display: inline-block;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    margin-top: 4px; /* Subtle push down */
    margin-right: 16px; /* Space between toggle and sign-in button */
  }

  .theme-toggle:focus {
    outline: none;
  }

  /* Toggle Track (Background) */
  .theme-toggle__track {
    position: relative;
    width: 42px;
    height: 21px;
    background-color: var(--toggle-track-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--toggle-track-border);
    border-radius: 10.5px;
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }

  .theme-toggle:hover .theme-toggle__track {
    background-color: var(--toggle-track-hover);
  }

  /* Toggle Thumb (Sliding Circle) */
  .theme-toggle__thumb {
    position: absolute;
    top: 1px;
    left: 2px;
    width: 17px;
    height: 17px;
    background-color: var(--toggle-thumb-bg);
    border-radius: 50%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* Light mode - slide thumb to right */
  .theme-toggle__thumb--light {
    transform: translateX(20px);
  }

  /* Icons */
  .theme-toggle__icon {
    width: 11px;
    height: 11px;
    position: absolute;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  /* Sun icon - visible in light mode */
  .theme-toggle__icon--sun {
    color: #FDB813;
    opacity: 0;
    transform: scale(0.8) rotate(-180deg);
  }

  .theme-toggle__thumb--light .theme-toggle__icon--sun {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  /* Moon icon - visible in dark mode */
  .theme-toggle__icon--moon {
    color: #6B7280;
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  .theme-toggle__thumb--light .theme-toggle__icon--moon {
    opacity: 0;
    transform: scale(0.8) rotate(180deg);
  }

  /* Top controls container for toggle and auth */
  .top-controls {
    position: absolute !important;
    top: 1rem !important;
    right: 1rem !important;
    display: flex !important;
    align-items: center !important;
    z-index: 20 !important;
  }
`;