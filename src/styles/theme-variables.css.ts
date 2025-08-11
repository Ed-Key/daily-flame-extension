export const themeVariables = `
  /* Theme Variables - CSS Custom Properties */
  :host {
    /* Dark Theme (Default) */
    --bg-primary: rgba(0, 0, 0, 0.95);
    --bg-overlay: rgba(0, 0, 0, 0.8);
    --bg-secondary: rgba(0, 0, 0, 0.5);
    
    --text-primary: white;
    --text-secondary: rgba(255, 255, 255, 0.7);
    --text-muted: rgba(255, 255, 255, 0.6);
    
    --glass-bg: rgba(255, 255, 255, 0.1);
    --glass-bg-hover: rgba(255, 255, 255, 0.15);
    --glass-bg-active: rgba(255, 255, 255, 0.2);
    
    --border-primary: rgba(255, 255, 255, 0.2);
    --border-secondary: rgba(255, 255, 255, 0.1);
    --border-active: rgba(255, 255, 255, 0.3);
    
    --button-bg: white;
    --button-text: black;
    --button-bg-hover: #f3f4f6;
    --button-border: rgba(255, 255, 255, 0.3);
    
    --button-secondary-bg: transparent;
    --button-secondary-text: white;
    --button-secondary-border: rgba(255, 255, 255, 0.3);
    --button-secondary-bg-hover: rgba(255, 255, 255, 0.1);
    
    --input-bg: rgba(255, 255, 255, 0.1);
    --input-border: rgba(255, 255, 255, 0.2);
    --input-text: white;
    --input-placeholder: rgba(255, 255, 255, 0.5);
    
    --dropdown-bg: rgba(255, 255, 255, 0.1);
    --dropdown-border: rgba(255, 255, 255, 0.2);
    --dropdown-item-hover: rgba(255, 255, 255, 0.1);
    
    --red-letter: #ff4444;
    --error-color: #ef4444;
    --success-color: #10b981;
    
    --shadow-sm: 0 2px 10px rgba(255, 255, 255, 0.2);
    --shadow-md: 0 4px 15px rgba(255, 255, 255, 0.3);
    --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.5);
    
    --avatar-bg: black;
    --avatar-border: white;
    --avatar-text: white;
    
    /* Top Controls Specific */
    --toggle-track-bg: rgba(255, 255, 255, 0.1);
    --toggle-track-border: rgba(255, 255, 255, 0.2);
    --toggle-track-hover: rgba(255, 255, 255, 0.15);
    --toggle-thumb-bg: white;
    
    --sign-in-text: rgba(255, 255, 255, 0.6);
    --sign-in-text-hover: rgba(255, 255, 255, 1);
    
    --profile-text: white;
    --profile-email: rgba(255, 255, 255, 0.6);
    --profile-menu-bg: rgba(255, 255, 255, 0.1);
    --profile-menu-border: rgba(255, 255, 255, 0.2);
    --profile-menu-divider: rgba(255, 255, 255, 0.1);
    --profile-menu-hover: rgba(255, 255, 255, 0.1);
  }
  
  /* Light Theme */
  :host([data-theme="light"]) {
    --bg-primary: rgba(255, 255, 255, 0.98);
    --bg-overlay: rgba(0, 0, 0, 0.8);  /* Keep same as dark mode for consistency */
    --bg-secondary: rgba(255, 255, 255, 0.9);
    
    --text-primary: #1a1a1a;
    --text-secondary: rgba(0, 0, 0, 0.7);
    --text-muted: rgba(0, 0, 0, 0.6);
    
    --glass-bg: rgba(0, 0, 0, 0.05);
    --glass-bg-hover: rgba(0, 0, 0, 0.08);
    --glass-bg-active: rgba(0, 0, 0, 0.1);
    
    --border-primary: rgba(0, 0, 0, 0.15);
    --border-secondary: rgba(0, 0, 0, 0.1);
    --border-active: rgba(0, 0, 0, 0.2);
    
    --button-bg: #1a1a1a;
    --button-text: white;
    --button-bg-hover: #333333;
    --button-border: rgba(0, 0, 0, 0.2);
    
    --button-secondary-bg: transparent;
    --button-secondary-text: #1a1a1a;
    --button-secondary-border: rgba(0, 0, 0, 0.2);
    --button-secondary-bg-hover: rgba(0, 0, 0, 0.05);
    
    --input-bg: rgba(0, 0, 0, 0.03);
    --input-border: rgba(0, 0, 0, 0.15);
    --input-text: #1a1a1a;
    --input-placeholder: rgba(0, 0, 0, 0.4);
    
    --dropdown-bg: rgba(255, 255, 255, 0.98);
    --dropdown-border: rgba(0, 0, 0, 0.15);
    --dropdown-item-hover: rgba(0, 0, 0, 0.05);
    
    --red-letter: #cc0000;
    --error-color: #dc2626;
    --success-color: #059669;
    
    --shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.15);
    --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.2);
    
    --avatar-bg: white;
    --avatar-border: #1a1a1a;
    --avatar-text: #1a1a1a;
    
    /* Top Controls Specific - Light Mode */
    --toggle-track-bg: rgba(0, 0, 0, 0.1);
    --toggle-track-border: rgba(0, 0, 0, 0.2);
    --toggle-track-hover: rgba(0, 0, 0, 0.15);
    --toggle-thumb-bg: white;
    
    --sign-in-text: #6B7280;
    --sign-in-text-hover: #000000;
    
    --profile-text: #1a1a1a;
    --profile-email: rgba(0, 0, 0, 0.6);
    --profile-menu-bg: rgba(255, 255, 255, 0.98);
    --profile-menu-border: rgba(0, 0, 0, 0.15);
    --profile-menu-divider: rgba(0, 0, 0, 0.1);
    --profile-menu-hover: rgba(0, 0, 0, 0.05);
  }
  
  /* Theme-aware text shadow */
  :host {
    --text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  
  :host([data-theme="light"]) {
    --text-shadow: none;
  }
  
  /* Backdrop filter - consistent across themes */
  :host {
    --backdrop-blur: blur(4px);
  }
  
  :host([data-theme="light"]) {
    --backdrop-blur: blur(4px);  /* Keep same blur effect as dark mode */
  }
`;