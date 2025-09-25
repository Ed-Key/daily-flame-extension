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

  /* Sidebar Panel - slides in from right, extends to modal edges */
  .settings-sidebar-panel {
    position: absolute;
    top: 0;         /* Extend to top edge of modal */
    right: 0;       /* Extend to right edge of modal */
    bottom: 0;      /* Extend to bottom edge of modal */
    width: 40%;     /* Takes 40% of modal width */
    min-width: 300px;
    max-width: 450px;
    background: white; /* White like the example */
    z-index: 101;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15), /* Subtle shadow for depth */
                -2px 0 8px rgba(0, 0, 0, 0.1);
    border-radius: 0 20px 20px 0; /* Round RIGHT corners to match modal's shape */
    transform: translateX(100%); /* Start fully hidden to the right */
    opacity: 1; /* Keep fully opaque, only slide animation */
    overflow: hidden; /* Ensure content respects rounded corners */
  }

  /* Content inside the settings panel */
  .settings-sidebar-content {
    padding: 48px 30px 30px 30px; /* Extra top padding for close button */
    height: 100%;
    overflow-y: auto;
    color: #333; /* Dark text for white background */
  }

  .settings-sidebar-title {
    font-size: 24px;
    font-weight: 500;
    margin: 0 0 10px 0;
    color: #333;
  }

  .settings-sidebar-description {
    font-size: 14px;
    margin: 0 0 20px 0;
    opacity: 0.7;
    color: #666;
  }

  /* Close button */
  .settings-sidebar-close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(0, 0, 0, 0.05);
    color: #666;
    font-size: 24px;
    line-height: 1;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .settings-sidebar-close:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #333;
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
`;