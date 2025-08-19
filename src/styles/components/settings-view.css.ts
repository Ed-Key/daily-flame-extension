export const settingsViewStyles = `
  /* Settings View Container */
  .settings-view-container {
    padding: 20px 0;
    opacity: 1; /* Default visible as fallback if animation fails */
  }

  /* Settings Title */
  .settings-title {
    position: absolute;
    top: 30px;
    left: 48px;
    font-size: 32px;
    font-weight: 300;
    color: white;
    margin: 0;
    z-index: 10;
  }

  /* Settings Back Button */
  .settings-back-button {
    position: absolute;
    top: 80px;
    left: 48px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    z-index: 10;
    transition: all 0.2s ease;
  }

  .settings-back-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
  }

  /* Settings Section */
  .settings-section {
    margin-bottom: 32px;
  }

  /* Settings Label */
  .settings-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
    opacity: 0.9;
    color: white;
    text-align: left;
  }

  /* Settings Description */
  .settings-description {
    margin-top: 8px;
    font-size: 12px;
    opacity: 0.7;
    line-height: 1.4;
    color: white;
    text-align: left;
  }

  /* Light theme adjustments */
  :host([data-theme="light"]) .settings-title {
    color: #333;
  }

  :host([data-theme="light"]) .settings-back-button {
    border-color: rgba(0, 0, 0, 0.3);
    color: #333;
  }

  :host([data-theme="light"]) .settings-back-button:hover {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.4);
  }

  :host([data-theme="light"]) .settings-label {
    color: #333;
  }

  :host([data-theme="light"]) .settings-description {
    color: #666;
  }
`;