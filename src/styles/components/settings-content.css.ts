export const settingsContentStyles = `
  /* Settings Content Container */
  .settings-content {
    padding: 20px 0;
  }

  /* Settings Sections */
  .settings-section {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .settings-section:last-child {
    border-bottom: none;
  }

  .settings-section-title {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 20px 0;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 0.5px;
  }

  /* Settings Items */
  .settings-item {
    margin-bottom: 24px;
    transition: opacity 0.2s ease;
  }

  .settings-item:last-child {
    margin-bottom: 0;
  }

  .settings-item--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  /* Labels */
  .settings-label {
    display: block;
    margin-bottom: 12px;
  }

  .settings-label-text {
    display: block;
    font-size: 15px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 4px;
  }

  .settings-label-description {
    display: block;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.4;
  }

  /* Theme Toggle Buttons */
  .settings-theme-toggle {
    display: flex;
    gap: 0; /* No gap, separator will handle spacing */
    padding: 0; /* Remove padding so buttons can fill completely */
    background: rgba(0, 0, 0, 0.2);
    /* No border-radius for rectangular design */
    position: relative;
    overflow: hidden; /* Ensure buttons don't overflow */
  }

  .settings-theme-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 16px !important; /* Matches the original size with 4px container padding */
    background: transparent !important;
    border: none;
    /* No border-radius for rectangular buttons */
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease !important; /* Added !important for transition */
    position: relative;
  }

  /* Separator between theme options - full height */
  .settings-theme-option:first-child::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0; /* Full height from top */
    bottom: 0; /* Full height to bottom */
    width: 1px;
    background: rgba(255, 255, 255, 0.2);
    z-index: 1;
  }

  /* Greyish hover effect for non-active buttons */
  .settings-theme-option:hover:not(.settings-theme-option--active) {
    background: rgba(128, 128, 128, 0.25) !important; /* Greyish background on hover */
    color: rgba(255, 255, 255, 0.85);
  }

  .settings-theme-option--active {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* Dark theme active states */
  /* Light button active in dark theme = white background, dark text */
  .settings-theme-option--active.settings-theme-option--light {
    background: rgba(255, 255, 255, 0.9) !important;
    color: rgba(0, 0, 0, 0.9) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }

  /* Dark button active in dark theme = white background, dark text (inverted) */
  .settings-theme-option--active.settings-theme-option--dark {
    background: rgba(255, 255, 255, 0.9) !important;
    color: rgba(0, 0, 0, 0.9) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }

  .settings-theme-option:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .settings-theme-icon {
    width: 18px;
    height: 18px;
  }

  /* Select Dropdown */
  .settings-select {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px !important;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .settings-select:hover {
    background: rgba(255, 255, 255, 0.2) !important; /* More visible hover in dark mode */
    border-color: rgba(255, 255, 255, 0.4) !important;
  }

  .settings-select:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }

  .settings-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Style the dropdown options */
  .settings-select option {
    background: #1a1a1a;
    color: #ffffff;
    padding: 8px;
  }

  /* Placeholder for future features */
  .settings-placeholder {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 14px;
    text-align: center;
  }

  /* Saving Indicator */
  .settings-saving-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }

  /* Light Theme Overrides */
  :host([data-theme="light"]) .settings-section {
    border-bottom-color: rgba(0, 0, 0, 0.1);
  }

  :host([data-theme="light"]) .settings-section-title {
    color: rgba(0, 0, 0, 0.9);
  }

  :host([data-theme="light"]) .settings-label-text {
    color: rgba(0, 0, 0, 0.85);
  }

  :host([data-theme="light"]) .settings-label-description {
    color: rgba(0, 0, 0, 0.6);
  }

  :host([data-theme="light"]) .settings-theme-toggle {
    background: rgba(0, 0, 0, 0.05);
    /* No padding in light theme either */
  }

  /* Light theme separator - full height */
  :host([data-theme="light"]) .settings-theme-option:first-child::after {
    background: rgba(0, 0, 0, 0.15);
    top: 0;
    bottom: 0;
  }

  :host([data-theme="light"]) .settings-theme-option {
    color: rgba(0, 0, 0, 0.6);
  }

  /* Greyish hover effect for light theme */
  :host([data-theme="light"]) .settings-theme-option:hover:not(.settings-theme-option--active) {
    background: rgba(128, 128, 128, 0.15) !important; /* Lighter grey for light theme */
    color: rgba(0, 0, 0, 0.8);
  }

  :host([data-theme="light"]) .settings-theme-option--active {
    background: rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  /* Invert colors for active states in light theme */
  /* Light button active in light theme = dark background, white text */
  :host([data-theme="light"]) .settings-theme-option--active.settings-theme-option--light {
    background: #161616 !important;
    color: white !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  }

  /* Dark button active in light theme = white background, dark text */
  :host([data-theme="light"]) .settings-theme-option--active.settings-theme-option--dark {
    background: white !important;
    color: #161616 !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  }

  :host([data-theme="light"]) .settings-select {
    background: rgba(0, 0, 0, 0.05) !important;
    border-color: rgba(0, 0, 0, 0.1) !important;
    color: rgba(0, 0, 0, 1) !important; /* Pure black text in light mode */
  }

  :host([data-theme="light"]) .settings-select:hover {
    background: rgba(128, 128, 128, 0.15) !important; /* Greyish hover for light theme */
    border-color: rgba(0, 0, 0, 0.15) !important;
  }

  :host([data-theme="light"]) .settings-select:focus {
    background: rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.2);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
  }

  :host([data-theme="light"]) .settings-select option {
    background: #ffffff;
    color: #000000;
  }

  :host([data-theme="light"]) .settings-placeholder {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);
    color: rgba(0, 0, 0, 0.4);
  }

  :host([data-theme="light"]) .settings-saving-indicator {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.7);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .settings-content {
      padding: 16px 0;
    }

    .settings-section {
      margin-bottom: 24px;
      padding-bottom: 20px;
    }

    .settings-section-title {
      font-size: 16px;
      margin-bottom: 16px;
    }

    .settings-item {
      margin-bottom: 20px;
    }

    .settings-theme-toggle {
      flex-direction: column;
    }

    .settings-theme-option {
      width: 100%;
    }
  }
`;