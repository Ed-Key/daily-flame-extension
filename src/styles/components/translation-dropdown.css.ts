export const translationDropdownStyles = `
  /* Translation Dropdown Container */
  .translation-dropdown {
    position: relative !important;
    display: inline-block !important;
    vertical-align: baseline !important;
    margin-left: 8px !important; /* Add space between verse reference and translation */
    z-index: 10 !important; /* Ensure proper stacking within modal */
  }

  /* Translation Button (Trigger) */
  .translation-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    padding: 0;
    color: white;
    font-size: 20px;
    font-style: normal;
    font-weight: normal;
    line-height: inherit; /* Inherit line height from parent */
    cursor: pointer;
    transition: opacity 0.2s ease-out, background-color 0.2s ease-out;
    position: relative;
    opacity: 1; /* Start at full opacity */
    vertical-align: baseline; /* Match baseline with verse reference */
  }

  .translation-button:hover {
    opacity: 0.7; /* Dim on hover */
  }

  .translation-button:focus {
    outline: none;
  }

  /* Open state background - maintain hover appearance */
  .translation-button--open {
    opacity: 0.7; /* Same as hover state */
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 4px 8px;
    /* No negative margin - let it naturally expand */
  }
  
  /* Ensure open state maintains dim appearance even without hover */
  .translation-button--open:not(:hover) {
    opacity: 0.7;
  }

  /* Translation text */
  .translation-button__text {
    display: inline-block;
    font-size: 20px;
  }

  /* Chevron Icon */
  .translation-chevron {
    width: 20px;
    height: 20px;
    opacity: 0.8;
    transition: opacity 0.2s ease-out, transform 0.2s ease-out;
    transform-origin: center;
  }

  .translation-button:hover .translation-chevron {
    opacity: 1;
  }

  /* Rotate chevron when open */
  .translation-button--open .translation-chevron {
    transform: rotate(180deg);
  }

  /* Dropdown Menu */
  .translation-dropdown-menu {
    position: absolute !important;
    top: calc(100% + 8px) !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background-color: rgb(26, 26, 26) !important; /* Solid dark background */
    background: rgb(26, 26, 26) !important; /* Fallback */
    border-radius: 0.5rem !important;
    border: 2px solid rgba(255, 255, 255, 0.2) !important;
    z-index: 1000 !important; /* Higher z-index than modal content */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8) !important;
    opacity: 1 !important; /* Ensure full opacity */
    padding: 1 !important; 
  }

  /* Translation Option Items */
  .translation-option {
    width: 100% !important;
    text-align: left !important;
    padding: 0.75rem 1rem !important; /* Increased vertical padding */
    color: rgba(255, 255, 255, 0.9) !important;
    font-size: 14px !important;
    background: rgb(26, 26, 26) !important; /* Match menu background */
    background-color: rgb(26, 26, 26) !important;
    border: none !important;
    border-radius: 0 !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
    display: block !important;
    white-space: nowrap !important;
    position: relative !important;
    margin: 0 !important;
  }

  /* Add separator between options */
  .translation-option:not(:last-child)::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0.75rem;
    right: 0.75rem;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .translation-option:hover {
    background-color: rgb(51, 51, 51) !important; /* Slightly lighter solid color */
    color: white !important;
  }

  /* Active/selected translation with glow effect */
  .translation-option--active {
    background-color: rgb(51, 51, 51) !important; /* Solid color */
    color: white !important;
    font-weight: 500 !important;
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.1) !important;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3) !important;
  }

  .translation-option--active:hover {
    background-color: rgb(64, 64, 64) !important; /* Slightly lighter on hover */
  }
`;