export const settingsSidebarStyles = `
  /* Dimming effect for verse content when settings are open */
  .verse-dimmed {
    filter: brightness(0.7);
    transition: filter 0.3s ease;
    pointer-events: none; /* Disable interaction with verse content */
  }

  /* Backdrop overlay - transparent, just for click detection */
  .settings-sidebar-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent; /* No visual effect, just click detection */
    z-index: 100;
    cursor: default;
  }

  /* Sidebar Panel - slides in from right, flush against modal edges */
  .settings-sidebar-panel {
    position: absolute;
    top: 0;           /* Flush against top edge */
    right: 0;         /* Flush against right edge */
    bottom: 0;        /* Flush against bottom edge */
    width: 40%;       /* Takes 40% of modal width */
    min-width: 300px;
    max-width: 450px;
    /* Glassmorphic effect - inspired by original profile dropdown */
    background: rgba(255, 255, 255, 0.08); /* Semi-transparent white */
    backdrop-filter: blur(16px); /* Frosted glass effect */
    -webkit-backdrop-filter: blur(16px); /* Safari support */
    z-index: 101;
    /* Enhanced glassmorphic shadow and border */
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.3), /* Ambient shadow */
                inset 0 0 0 1px rgba(255, 255, 255, 0.1); /* Subtle inner border */
    border-left: 1px solid rgba(255, 255, 255, 0.2); /* Left edge highlight */
    border-radius: 0 20px 20px 0; /* Match modal's border-radius exactly */
    transform: translateX(100%); /* Start fully hidden to the right */
    opacity: 1; /* Keep fully opaque, only slide animation */
    overflow: hidden; /* Ensure content respects rounded corners */
  }

  /* Content inside the settings panel */
  .settings-sidebar-content {
    padding: 0 30px 30px 30px; /* No top padding, header handles that */
    height: calc(100% - 90px); /* Account for header height */
    overflow-y: auto;
    color: rgba(255, 255, 255, 0.95); /* White text for glassmorphic background */
  }

  /* Thin, subtle scrollbar matching context view */
  .settings-sidebar-content::-webkit-scrollbar {
    width: 4px;
  }

  .settings-sidebar-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .settings-sidebar-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  .settings-sidebar-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .settings-sidebar-separator {
    height: 1px;
    background: rgba(255, 255, 255, 0.15);
    margin: 0 30px 20px 30px;
    width: calc(100% - 60px);
  }

  /* Settings header container */
  .settings-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between; /* Space between title and button */
    padding: 20px 30px;
    margin-bottom: 10px;
  }

  /* Circular back button with arrow - transparent by default */
  .settings-back-btn {
    position: relative;
    width: 40px;
    height: 40px;
    background: transparent; /* No background by default */
    border: none; /* No border by default */
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.8);
    font-size: 20px;
    font-weight: 300;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Google Material Icon arrow container */
  .settings-back-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    opacity: 1 !important; /* Ensure visibility - override any conflicting styles */
  }

  /* Style the SVG arrow */
  .settings-back-arrow svg {
    width: 24px;
    height: 24px;
    fill: rgba(255, 255, 255, 0.9);
  }

  .settings-back-arrow svg path {
    fill: rgba(255, 255, 255, 0.9);
  }

  /* Hover state - circular background appears */
  .settings-back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transform: scale(1.05);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 1);
  }

  /* Settings title next to button */
  .settings-header-title {
    font-size: 24px;
    font-weight: 500;
    margin: 0;
    color: rgba(255, 255, 255, 1);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  /* Close button (keeping for potential future use) */
  .settings-sidebar-close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 32px;
    height: 32px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1); /* Glassmorphic button */
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: rgba(255, 255, 255, 0.8);
    font-size: 24px;
    line-height: 1;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .settings-sidebar-close:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 1);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .settings-sidebar-panel {
      width: 70%;
      min-width: 250px;
    }
  }

  @media (max-width: 480px) {
    .settings-sidebar-panel {
      width: 85%;
      min-width: 200px;
    }
  }

  /* Light Theme Overrides */
  :host([data-theme="light"]) .settings-sidebar-panel {
    /* Light theme glassmorphic effect */
    background: rgba(0, 0, 0, 0.04); /* Very light dark overlay */
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.1),
                inset 0 0 0 1px rgba(0, 0, 0, 0.05);
    border-left: 1px solid rgba(0, 0, 0, 0.1);
  }

  :host([data-theme="light"]) .settings-sidebar-content {
    color: rgba(0, 0, 0, 0.9); /* Dark text for light theme */
  }

  :host([data-theme="light"]) .settings-sidebar-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
  }

  :host([data-theme="light"]) .settings-sidebar-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }


  :host([data-theme="light"]) .settings-sidebar-separator {
    background: rgba(0, 0, 0, 0.1);
  }

  :host([data-theme="light"]) .settings-header {
    /* Same structure in light theme */
  }

  :host([data-theme="light"]) .settings-back-btn {
    background: transparent;
    border: none;
    color: rgba(0, 0, 0, 0.7);
  }

  :host([data-theme="light"]) .settings-back-arrow svg,
  :host([data-theme="light"]) .settings-back-arrow svg path {
    fill: rgba(0, 0, 0, 0.7);
  }

  :host([data-theme="light"]) .settings-back-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  :host([data-theme="light"]) .settings-back-btn:hover .settings-back-arrow svg,
  :host([data-theme="light"]) .settings-back-btn:hover .settings-back-arrow svg path {
    fill: rgba(0, 0, 0, 0.9);
  }

  :host([data-theme="light"]) .settings-header-title {
    color: rgba(0, 0, 0, 1);
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  }

  :host([data-theme="light"]) .settings-sidebar-close {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.6);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }

  :host([data-theme="light"]) .settings-sidebar-close:hover {
    background: rgba(0, 0, 0, 0.1);
    border-color: rgba(0, 0, 0, 0.15);
    color: rgba(0, 0, 0, 0.9);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
`;