export const settingsViewStyles = `
  /* Settings View Container */
  .settings-view-container {
    padding: 20px 0;
    opacity: 1; /* Default visible as fallback if animation fails */
  }

  /* Settings Title */
  .settings-title {
    position: absolute;
    top: 65px;
    left: 48px;
    font-size: 32px;
    font-weight: 300;
    color: white;
    margin: 0;
    z-index: 10;
  }

  /* Settings Back Button - Positioned next to logo */
  .settings-back-button {
    position: absolute;
    top: 24px; /* Aligned with logo */
    left: 80px; /* Next to the logo (logo is 60px + some spacing) */
    background: rgba(255, 255, 255, 0.1); /* Start with background */
    border: none;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    z-index: 10;
    transition: background 0.2s ease, opacity 0.2s ease;
    opacity: 1; /* Start at full opacity */
    display: flex;
    align-items: center;
    overflow: hidden; /* Hide arrow when it's off to the left */
  }

  /* Arrow element */
  .settings-back-arrow {
    display: inline-block;
    margin-right: 0px; /* Start with no margin */
    opacity: 0; /* Start invisible */
    transform: translateX(-10px); /* Start off to the left */
    transition: opacity 0.3s ease, transform 0.3s ease, margin-right 0.3s ease;
  }

  /* Text element */
  .settings-back-text {
    display: inline-block;
    transition: transform 0.3s ease;
  }

  .settings-back-button:hover {
    opacity: 0.7; /* Dimmed opacity on hover */
    background: transparent; /* Remove background on hover */
    border-radius: 4px;
  }

  /* Arrow animation on hover */
  .settings-back-button:hover .settings-back-arrow {
    opacity: 1; /* Fade in arrow */
    transform: translateX(0); /* Slide arrow to position */
    margin-right: 6px; /* Add space between arrow and text */
  }

  /* Text slides right on hover */
  .settings-back-button:hover .settings-back-text {
    transform: translateX(2px); /* Slight slide to make room */
  }

  /* Settings Section */
  .settings-section {
    margin-bottom: 32px;
  }

  /* Settings Label Row - Container for label and description */
  .settings-label-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between; /* Push items to opposite ends */
    gap: 16px;
    margin-bottom: 12px;
  }

  /* Settings Label */
  .settings-label {
    font-size: 17px;
    font-weight: 500;
    opacity: 0.9;
    color: white;
    flex-shrink: 0;
  }

  /* Settings Description */
  .settings-description {
    font-size: 12px;
    opacity: 0.7;
    line-height: 1.4;
    color: white;
    margin: 0;
    padding-top: 3px; /* Slight adjustment to align baselines */
    text-align: right; /* Right-align the text */
    flex: 1; /* Take up remaining space */
  }

  /* Light theme adjustments */
  :host([data-theme="light"]) .settings-title {
    color: #333;
  }

  :host([data-theme="light"]) .settings-back-button {
    color: #333;
    background: rgba(0, 0, 0, 0.05); /* Start with background in light mode */
    opacity: 1;
  }

  :host([data-theme="light"]) .settings-back-button:hover {
    opacity: 0.7; /* Dimmed on hover */
    background: transparent; /* Remove background on hover */
  }

  :host([data-theme="light"]) .settings-label {
    color: #333;
  }

  :host([data-theme="light"]) .settings-description {
    color: #666;
  }
`;