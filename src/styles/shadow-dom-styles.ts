// Complete styles for Shadow DOM encapsulation
export const getShadowDomStyles = (): string => {
  return `
    /* CSS Reset for Shadow DOM */
    :host {
      all: initial;
      display: block !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
      font-size: 16px !important;
      line-height: 1.5 !important;
      color: white !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: inherit;
    }
    
    /* Main overlay container - now acts as backdrop */
    .verse-overlay {
      position: fixed !important;
      inset: 0 !important;
      background-color: rgba(0, 0, 0, 0.8) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 999999 !important;
      padding: 20px !important;
      width: 100% !important;
      height: 100% !important;
      overflow: visible !important; /* Allow modal animations to show */
      transition: backdrop-filter 0.3s ease-out !important;
    }
    
    /* Blurred backdrop state */
    .verse-overlay.backdrop-blur {
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
    }
    
    /* Modal container */
    .verse-modal {
      background-color: rgba(0, 0, 0, 0.95) !important;
      border-radius: 16px !important;
      padding: 90px 48px 48px 48px !important;
      max-width: 840px !important;
      width: 90% !important;
      min-height: 400px !important;
      max-height: 85vh !important;
      overflow: visible !important; /* Allow content to be visible during animations */
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
    /* Verse content container */
    .verse-content {
      width: 100% !important;
      text-align: center !important;
      color: white !important;
      position: relative !important;
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: visible !important; /* Allow animations to show outside bounds */
      padding-top: 20px !important; /* Add padding to accommodate upward animations */
    }
    
    /* Verse text styles */
    .verse-text {
      font-size: 28px !important;
      line-height: 40px !important;
      margin-bottom: 20px !important;
      font-weight: 300 !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
      color: white !important;
    }
    
    /* Words of Jesus - Red Letter styling */
    .words-of-jesus {
      color: #ff4444 !important;
    }
    
    /* ESV HTML format uses 'woc' class */
    .woc {
      color: #ff4444 !important;
    }
    
    .verse-word {
      display: inline-block !important;
      margin-right: 0.25em !important;
      white-space: nowrap !important; /* Prevent breaking within words */
    }
    
    .verse-letter {
      display: inline-block !important;
      /* No margin needed - letters should be tight within words */
    }
    
    .verse-quote {
      display: inline-block !important;
      font-size: inherit !important;
      color: inherit !important;
    }
    
    .opening-quote {
      margin-right: 0.15em !important;
    }
    
    .closing-quote {
      margin-left: -0.1em !important;
    }
    
    /* Verse reference container */
    .verse-reference-container {
      position: relative !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin-bottom: 20px !important; /* Space before verse text */
      width: 100% !important;
      overflow: hidden !important;
    }
    
    /* Verse reference */
    .verse-reference {
      font-size: 20px !important;
      line-height: 28px !important;
      font-style: italic !important;
      opacity: 0.9;
      font-weight: normal !important;
      color: white !important;
      padding: 0 20px !important;
      position: relative !important;
      z-index: 1 !important;
    }
    
    /* Decorative lines */
    .verse-reference-line {
      position: absolute !important;
      top: 50% !important;
      height: 1px !important;
      background-color: rgba(255, 255, 255, 0.3) !important;
      width: 0 !important;
      transition: width 0.8s ease-out !important;
      transform: translateY(-50%) !important;
    }
    
    .verse-reference-line.left {
      right: 50% !important;
      margin-right: 100px !important; /* Increased gap for better spacing */
    }
    
    .verse-reference-line.right {
      left: 50% !important;
      margin-left: 100px !important; /* Increased gap for better spacing */
    }
    
    .verse-reference-line.animate {
      width: 40% !important;
      max-width: 200px !important;
    }

    
    /* Button container */
    .verse-button-container {
      display: flex !important;
      gap: 16px !important;
      justify-content: center !important;
      align-items: center !important;
      margin-top: -15px !important; /* Move buttons up slightly to overlap with verse */
    }
    
    /* Shared button styles */
    .verse-btn {
      background-color: white !important;
      color: black !important;
      border: none !important;
      padding: 16px 40px !important;
      font-size: 18px !important;
      font-weight: 600 !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      min-width: 120px !important;
      box-shadow: 0 2px 10px rgba(255, 255, 255, 0.2) !important;
      display: inline-block !important;
      text-align: center !important;
      line-height: 1 !important;
      outline: none !important;
    }
    
    .verse-btn:hover {
      background-color: #f3f4f6 !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3) !important;
    }
    
    .verse-btn:active {
      transform: translateY(0) !important;
      box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2) !important;
    }
    
    .verse-btn:focus {
      outline: none !important;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5) !important;
    }
    
    /* More button specific styles */
    .verse-more-btn {
      background-color: transparent !important;
      color: white !important;
      border: 2px solid rgba(255, 255, 255, 0.3) !important;
      padding: 14px 36px !important;
    }
    
    .verse-more-btn:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
      border-color: rgba(255, 255, 255, 0.5) !important;
    }
    
    /* Modal styles */
    .modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      background-color: rgba(0, 0, 0, 0.5) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 1000000 !important;
      padding: 16px !important;
    }
    
    .modal-content {
      background-color: white !important;
      border-radius: 8px !important;
      padding: 24px !important;
      max-width: 448px !important;
      width: 100% !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
    }

    /* Glassmorphism modal styles */
    .df-glassmorphism-modal {
      background-color: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      box-shadow: 0 4px 20px 0 rgba(255, 255, 255, 0.1) !important;
    }

    /* Modal close button */
    .modal-close-btn {
      position: absolute !important;
      top: 16px !important;
      right: 16px !important;
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background-color: rgba(255, 255, 255, 0.1) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      border-radius: 50% !important;
      color: white !important;
      font-size: 24px !important;
      line-height: 1 !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      outline: none !important;
    }

    .modal-close-btn:hover {
      background-color: rgba(255, 255, 255, 0.2) !important;
      transform: scale(1.1) !important;
    }

    .modal-close-btn:active {
      transform: scale(0.95) !important;
    }
    
    /* Form elements - only apply default styles if not using glassmorphism */
    input[type="text"]:not(.df-glassmorphism-input),
    input[type="email"]:not(.df-glassmorphism-input),
    input[type="password"]:not(.df-glassmorphism-input) {
      font-family: inherit !important;
      font-size: 16px !important;
      line-height: 24px !important;
      width: 100% !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
      background-color: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      outline: none !important;
      transition: all 0.15s !important;
    }
    
    /* Glassmorphism input specific styles */
    .df-glassmorphism-input {
      font-family: inherit !important;
      font-size: 16px !important;
      line-height: 24px !important;
      width: 100% !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
      background-color: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      outline: none !important;
      transition: all 0.15s !important;
    }
    
    .df-glassmorphism-input::placeholder {
      color: rgba(255, 255, 255, 0.7) !important;
    }
    
    .df-glassmorphism-input:focus {
      outline: none !important;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5) !important;
      background-color: rgba(255, 255, 255, 0.25) !important;
    }
    
    input[type="checkbox"] {
      width: 16px !important;
      height: 16px !important;
      margin-right: 8px !important;
      cursor: pointer !important;
      accent-color: #3b82f6 !important;
    }
    
    button {
      font-family: inherit !important;
      font-size: 16px !important;
      line-height: 24px !important;
      cursor: pointer !important;
      transition: all 0.15s !important;
      background-color: transparent !important;
      border: none !important;
      padding: 0 !important;
      color: inherit !important;
    }
    
    /* Button with specific styles should override the defaults */
    button[class*="bg-"],
    button[class*="px-"],
    button[class*="py-"],
    button[class*="rounded"] {
      background-color: initial;
      border: initial;
      padding: initial;
    }
    
    select {
      font-family: inherit !important;
      font-size: 16px !important;
      line-height: 24px !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
      background-color: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      outline: none !important;
      cursor: pointer !important;
    }
    
    /* Glassmorphism effects */
    .df-glassmorphism-element {
      background-color: rgba(255, 255, 255, 0.2) !important;
      backdrop-filter: blur(4px) !important;
      -webkit-backdrop-filter: blur(4px) !important;
    }
    
    .df-glassmorphism-element:hover {
      background-color: rgba(255, 255, 255, 0.3) !important;
    }
    
    .df-glassmorphism-modal {
      background-color: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      color: white !important;
    }
    
    .df-glassmorphism-input {
      background-color: rgba(255, 255, 255, 0.2) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
    }
    
    .df-glassmorphism-dropdown {
      background-color: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
    
    /* Modal close button styles */
    .modal-close-btn {
      position: absolute !important;
      top: 16px !important;
      right: 16px !important;
      font-size: 24px !important;
      line-height: 1 !important;
      color: white !important;
      opacity: 0.8 !important;
      background: transparent !important;
      border: none !important;
      cursor: pointer !important;
      padding: 4px !important;
      transition: opacity 0.2s !important;
    }
    
    .modal-close-btn:hover {
      opacity: 1 !important;
    }
    
    /* Toast notification styles */
    .toast-container {
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      z-index: 2000000 !important;
      pointer-events: none !important;
    }
    
    .toast {
      background-color: #333 !important;
      color: white !important;
      padding: 16px 24px !important;
      border-radius: 8px !important;
      margin-bottom: 10px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      min-width: 300px !important;
      max-width: 500px !important;
      pointer-events: auto !important;
      animation: slideIn 0.3s ease-out !important;
    }
    
    .toast.success {
      background-color: #10b981 !important;
    }
    
    .toast.error {
      background-color: #ef4444 !important;
    }
    
    .toast.info {
      background-color: #3b82f6 !important;
    }
    
    .toast.warning {
      background-color: #f59e0b !important;
    }
    
    /* Support for Toast component positioning */
    .space-y-2 > * + * { margin-top: 8px !important; }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Utility classes */
    .fixed { position: fixed !important; }
    .absolute { position: absolute !important; }
    
    /* Ensure sign-in button container doesn't clip glow */
    .absolute.top-4.right-4 {
      overflow: visible !important;
      z-index: 20 !important;
    }
    .relative { position: relative !important; }
    .inset-0 { top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; }
    .top-0 { top: 0 !important; }
    .top-4 { top: 16px !important; }
    .top-12 { top: 48px !important; }
    .top-20 { top: 80px !important; }
    .top-1\\/2 { top: 50% !important; }
    .right-0 { right: 0 !important; }
    .right-3 { right: 12px !important; }
    .right-4 { right: 16px !important; }
    .right-20 { right: 80px !important; }
    .bottom-4 { bottom: 16px !important; }
    .left-4 { left: 16px !important; }
    .z-10 { z-index: 10 !important; }
    .z-20 { z-index: 20 !important; }
    .z-50 { z-index: 50 !important; }
    .z-\\[999999\\] { z-index: 999999 !important; }
    .z-\\[1000000\\] { z-index: 1000000 !important; }
    .z-\\[1000001\\] { z-index: 1000001 !important; }
    .z-\\[2000000\\] { z-index: 2000000 !important; }
    
    .flex { display: flex !important; }
    .inline-block { display: inline-block !important; }
    .inline-flex { display: inline-flex !important; }
    .grid { display: grid !important; }
    .hidden { display: none !important; }
    .block { display: block !important; }
    
    .items-center { align-items: center !important; }
    .items-start { align-items: flex-start !important; }
    .justify-center { justify-content: center !important; }
    .justify-between { justify-content: space-between !important; }
    .justify-end { justify-content: flex-end !important; }
    .gap-1 { gap: 4px !important; }
    .gap-2 { gap: 8px !important; }
    .gap-3 { gap: 12px !important; }
    .gap-4 { gap: 16px !important; }
    .space-y-2 > * + * { margin-top: 8px !important; }
    .space-y-4 > * + * { margin-top: 16px !important; }
    
    .w-full { width: 100% !important; }
    .w-4 { width: 16px !important; }
    .w-5 { width: 20px !important; }
    .w-6 { width: 24px !important; }
    .w-8 { width: 32px !important; }
    .w-64 { width: 256px !important; }
    .w-80 { width: 320px !important; }
    .max-w-sm { max-width: 384px !important; }
    .max-w-md { max-width: 448px !important; }
    .max-w-lg { max-width: 512px !important; }
    .max-w-2xl { max-width: 672px !important; }
    .min-w-\\[120px\\] { min-width: 120px !important; }
    .min-w-\\[300px\\] { min-width: 300px !important; }
    .max-w-\\[90\\%\\] { max-width: 90% !important; }
    .max-w-\\[500px\\] { max-width: 500px !important; }
    
    .h-4 { height: 16px !important; }
    .h-5 { height: 20px !important; }
    .h-6 { height: 24px !important; }
    .h-8 { height: 32px !important; }
    .max-h-\\[90vh\\] { max-height: 90vh !important; }
    
    .p-0 { padding: 0 !important; }
    .p-2 { padding: 8px !important; }
    .p-3 { padding: 12px !important; }
    .p-4 { padding: 16px !important; }
    .p-5 { padding: 20px !important; }
    .p-6 { padding: 24px !important; }
    .px-2 { padding-left: 8px !important; padding-right: 8px !important; }
    .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
    .px-4 { padding-left: 16px !important; padding-right: 16px !important; }
    .px-6 { padding-left: 24px !important; padding-right: 24px !important; }
    .px-8 { padding-left: 32px !important; padding-right: 32px !important; }
    .px-10 { padding-left: 40px !important; padding-right: 40px !important; }
    .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
    .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
    .py-2\\.5 { padding-top: 10px !important; padding-bottom: 10px !important; }
    .py-3 { padding-top: 12px !important; padding-bottom: 12px !important; }
    .py-4 { padding-top: 16px !important; padding-bottom: 16px !important; }
    .pt-2 { padding-top: 8px !important; }
    .pb-3 { padding-bottom: 12px !important; }
    .pr-8 { padding-right: 32px !important; }
    .pr-10 { padding-right: 40px !important; }
    
    .m-0 { margin: 0 !important; }
    .mt-1 { margin-top: 4px !important; }
    .mt-2 { margin-top: 8px !important; }
    .mt-4 { margin-top: 16px !important; }
    .mb-1 { margin-bottom: 4px !important; }
    .mb-2 { margin-bottom: 8px !important; }
    .mb-4 { margin-bottom: 16px !important; }
    .mb-5 { margin-bottom: 20px !important; }
    .mb-10 { margin-bottom: 40px !important; }
    .mr-2 { margin-right: 8px !important; }
    .ml-2 { margin-left: 8px !important; }
    .ml-3 { margin-left: 12px !important; }
    
    .text-center { text-align: center !important; }
    .text-left { text-align: left !important; }
    .text-right { text-align: right !important; }
    .text-xs { font-size: 12px !important; line-height: 16px !important; }
    .text-sm { font-size: 14px !important; line-height: 20px !important; }
    .text-base { font-size: 16px !important; line-height: 24px !important; }
    .text-lg { font-size: 18px !important; line-height: 28px !important; }
    .text-xl { font-size: 20px !important; line-height: 28px !important; }
    .text-2xl { font-size: 24px !important; line-height: 32px !important; }
    .leading-6 { line-height: 24px !important; }
    .leading-relaxed { line-height: 1.625 !important; }
    
    .font-light { font-weight: 300 !important; }
    .font-normal { font-weight: 400 !important; }
    .font-medium { font-weight: 500 !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-bold { font-weight: 700 !important; }
    .italic { font-style: italic !important; }
    .underline { text-decoration: underline !important; }
    
    .text-white { color: white !important; }
    .text-black { color: black !important; }
    .text-gray-100 { color: #f3f4f6 !important; }
    .text-gray-300 { color: #d1d5db !important; }
    .text-gray-400 { color: #9ca3af !important; }
    .text-gray-500 { color: #6b7280 !important; }
    .text-gray-600 { color: #4b5563 !important; }
    .text-gray-700 { color: #374151 !important; }
    .text-blue-200 { color: #bfdbfe !important; }
    .text-blue-300 { color: #93c5fd !important; }
    .text-blue-400 { color: #60a5fa !important; }
    .text-blue-500 { color: #3b82f6 !important; }
    .text-blue-600 { color: #2563eb !important; }
    .text-red-200 { color: #fecaca !important; }
    .text-red-300 { color: #fca5a5 !important; }
    .text-red-400 { color: #f87171 !important; }
    .text-red-500 { color: #ef4444 !important; }
    .text-green-200 { color: #bbf7d0 !important; }
    .text-green-300 { color: #86efac !important; }
    .text-green-400 { color: #4ade80 !important; }
    .text-green-500 { color: #22c55e !important; }
    .text-inherit { color: inherit !important; }
    
    .bg-transparent { background-color: transparent !important; }
    .bg-black { background-color: black !important; }
    .bg-white { background-color: white !important; }
    .bg-gray-50 { background-color: #f9fafb !important; }
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .bg-gray-200 { background-color: #e5e7eb !important; }
    .bg-gray-700 { background-color: #374151 !important; }
    .bg-gray-800 { background-color: #1f2937 !important; }
    .bg-gray-900 { background-color: #111827 !important; }
    .bg-blue-50 { background-color: #eff6ff !important; }
    .bg-blue-100 { background-color: #dbeafe !important; }
    .bg-blue-500 { background-color: #3b82f6 !important; }
    .bg-blue-600 { background-color: #2563eb !important; }
    .bg-blue-700 { background-color: #1d4ed8 !important; }
    .bg-red-50 { background-color: #fef2f2 !important; }
    .bg-red-100 { background-color: #fee2e2 !important; }
    .bg-red-500 { background-color: #ef4444 !important; }
    .bg-red-600 { background-color: #dc2626 !important; }
    .bg-green-50 { background-color: #f0fdf4 !important; }
    .bg-green-100 { background-color: #dcfce7 !important; }
    .bg-green-500 { background-color: #22c55e !important; }
    .bg-green-600 { background-color: #16a34a !important; }
    .bg-gray-600 { background-color: #4b5563 !important; }
    
    .bg-opacity-10 { background-color: rgba(255, 255, 255, 0.1) !important; }
    .bg-opacity-20 { background-color: rgba(255, 255, 255, 0.2) !important; }
    .bg-opacity-30 { background-color: rgba(255, 255, 255, 0.3) !important; }
    .bg-opacity-50 { background-color: rgba(255, 255, 255, 0.5) !important; }
    .bg-opacity-70 { background-color: rgba(255, 255, 255, 0.7) !important; }
    
    .bg-white.bg-opacity-10 { background-color: rgba(255, 255, 255, 0.1) !important; }
    .bg-white.bg-opacity-20 { background-color: rgba(255, 255, 255, 0.2) !important; }
    .bg-white.bg-opacity-30 { background-color: rgba(255, 255, 255, 0.3) !important; }
    .bg-black.bg-opacity-50 { background-color: rgba(0, 0, 0, 0.5) !important; }
    .bg-red-500.bg-opacity-20 { background-color: rgba(239, 68, 68, 0.2) !important; }
    .bg-green-600.bg-opacity-20 { background-color: rgba(22, 163, 74, 0.2) !important; }
    .bg-blue-500.bg-opacity-20 { background-color: rgba(59, 130, 246, 0.2) !important; }
    
    .bg-red-600.bg-opacity-90 { background-color: rgba(220, 38, 38, 0.9) !important; }
    .bg-green-600.bg-opacity-90 { background-color: rgba(22, 163, 74, 0.9) !important; }
    .bg-blue-600.bg-opacity-90 { background-color: rgba(37, 99, 235, 0.9) !important; }
    .bg-gray-600.bg-opacity-90 { background-color: rgba(75, 85, 99, 0.9) !important; }
    
    .bg-opacity-90 { --tw-bg-opacity: 0.9 !important; }
    
    .text-opacity-70 { color: rgba(255, 255, 255, 0.7) !important; }
    .text-opacity-75 { color: rgba(255, 255, 255, 0.75) !important; }
    .text-opacity-90 { color: rgba(255, 255, 255, 0.9) !important; }
    
    .text-white.text-opacity-70 { color: rgba(255, 255, 255, 0.7) !important; }
    .text-white.text-opacity-75 { color: rgba(255, 255, 255, 0.75) !important; }
    .text-red-200.text-opacity-75 { color: rgba(254, 202, 202, 0.75) !important; }
    
    .border { border-width: 1px !important; }
    .border-2 { border-width: 2px !important; }
    .border-t { border-top-width: 1px !important; }
    .border-b { border-bottom-width: 1px !important; }
    .border-l { border-left-width: 1px !important; }
    .border-r { border-right-width: 1px !important; }
    .border-none { border: none !important; }
    .border-solid { border-style: solid !important; }
    
    .border-transparent { border-color: transparent !important; }
    .border-white { border-color: white !important; }
    .border-gray-200 { border-color: #e5e7eb !important; }
    .border-gray-300 { border-color: #d1d5db !important; }
    .border-gray-400 { border-color: #9ca3af !important; }
    .border-gray-700 { border-color: #374151 !important; }
    .border-blue-300 { border-color: #93c5fd !important; }
    .border-blue-400 { border-color: #60a5fa !important; }
    .border-blue-500 { border-color: #3b82f6 !important; }
    .border-red-300 { border-color: #fca5a5 !important; }
    .border-red-400 { border-color: #f87171 !important; }
    .border-red-500 { border-color: #ef4444 !important; }
    .border-green-300 { border-color: #86efac !important; }
    .border-green-400 { border-color: #4ade80 !important; }
    .border-green-500 { border-color: #22c55e !important; }
    .border-gray-400 { border-color: #9ca3af !important; }
    
    .border-opacity-10 { --tw-border-opacity: 0.1 !important; }
    .border-opacity-20 { --tw-border-opacity: 0.2 !important; }
    .border-opacity-30 { --tw-border-opacity: 0.3 !important; }
    .border-opacity-50 { --tw-border-opacity: 0.5 !important; }
    
    .border-white.border-opacity-20 { border-color: rgba(255, 255, 255, 0.2) !important; }
    .border-white.border-opacity-30 { border-color: rgba(255, 255, 255, 0.3) !important; }
    .border-red-400.border-opacity-50 { border-color: rgba(248, 113, 113, 0.5) !important; }
    .border-green-400.border-opacity-50 { border-color: rgba(74, 222, 128, 0.5) !important; }
    .border-blue-400.border-opacity-50 { border-color: rgba(96, 165, 250, 0.5) !important; }
    
    .rounded { border-radius: 4px !important; }
    .rounded-md { border-radius: 6px !important; }
    .rounded-lg { border-radius: 8px !important; }
    .rounded-xl { border-radius: 12px !important; }
    .rounded-full { border-radius: 9999px !important; }
    
    .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important; }
    .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; }
    .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important; }
    
    /* Backdrop blur utilities */
    .backdrop-blur-sm { backdrop-filter: blur(4px) !important; -webkit-backdrop-filter: blur(4px) !important; }
    .backdrop-blur-md { backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important; }
    .backdrop-blur-lg { backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important; }
    
    .opacity-0 { opacity: 0 !important; }
    .opacity-50 { opacity: 0.5 !important; }
    .opacity-70 { opacity: 0.7 !important; }
    .opacity-75 { opacity: 0.75 !important; }
    .opacity-90 { opacity: 0.9 !important; }
    .opacity-100 { opacity: 1 !important; }
    
    .cursor-default { cursor: default !important; }
    .cursor-pointer { cursor: pointer !important; }
    .cursor-not-allowed { cursor: not-allowed !important; }
    
    .select-none { user-select: none !important; }
    .select-text { user-select: text !important; }
    
    .outline-none { outline: none !important; }
    .outline { outline-style: solid !important; }
    
    .overflow-auto { overflow: auto !important; }
    .overflow-hidden { overflow: hidden !important; }
    .overflow-visible { overflow: visible !important; }
    .overflow-y-auto { overflow-y: auto !important; }
    .overflow-x-hidden { overflow-x: hidden !important; }
    
    .pointer-events-none { pointer-events: none !important; }
    .pointer-events-auto { pointer-events: auto !important; }
    
    .transition { transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform !important; transition-duration: 150ms !important; }
    .transition-all { transition-property: all !important; transition-duration: 150ms !important; }
    .transition-colors { transition-property: background-color, border-color, color, fill, stroke !important; transition-duration: 150ms !important; }
    .transition-opacity { transition-property: opacity !important; transition-duration: 150ms !important; }
    .transition-transform { transition-property: transform !important; transition-duration: 150ms !important; }
    .duration-75 { transition-duration: 75ms !important; }
    .duration-100 { transition-duration: 100ms !important; }
    .duration-150 { transition-duration: 150ms !important; }
    .duration-200 { transition-duration: 200ms !important; }
    .duration-300 { transition-duration: 300ms !important; }
    .duration-500 { transition-duration: 500ms !important; }
    .ease-in { transition-timing-function: cubic-bezier(0.4, 0, 1, 1) !important; }
    .ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1) !important; }
    .ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; }
    
    .transform { transform: translateX(var(--tw-translate-x, 0)) translateY(var(--tw-translate-y, 0)) rotate(var(--tw-rotate, 0)) skewX(var(--tw-skew-x, 0)) skewY(var(--tw-skew-y, 0)) scaleX(var(--tw-scale-x, 1)) scaleY(var(--tw-scale-y, 1)) !important; }
    .-translate-y-0\\.5 { --tw-translate-y: -2px !important; }
    .-translate-y-1\\/2 { --tw-translate-y: -50% !important; }
    .translate-y-0 { --tw-translate-y: 0 !important; }
    .translate-x-0 { --tw-translate-x: 0 !important; }
    .-translate-x-2 { --tw-translate-x: -8px !important; }
    .translate-x-full { --tw-translate-x: 100% !important; }
    .scale-95 { --tw-scale-x: 0.95 !important; --tw-scale-y: 0.95 !important; }
    .scale-100 { --tw-scale-x: 1 !important; --tw-scale-y: 1 !important; }
    
    /* Hover states */
    .hover\\:bg-gray-50:hover { background-color: #f9fafb !important; }
    .hover\\:bg-gray-100:hover { background-color: #f3f4f6 !important; }
    .hover\\:bg-gray-200:hover { background-color: #e5e7eb !important; }
    .hover\\:bg-gray-700:hover { background-color: #374151 !important; }
    .hover\\:bg-blue-600:hover { background-color: #2563eb !important; }
    .hover\\:bg-blue-700:hover { background-color: #1d4ed8 !important; }
    .hover\\:bg-red-600:hover { background-color: #dc2626 !important; }
    .hover\\:bg-green-600:hover { background-color: #16a34a !important; }
    .hover\\:bg-opacity-10:hover { background-color: rgba(255, 255, 255, 0.1) !important; }
    .hover\\:bg-opacity-20:hover { background-color: rgba(255, 255, 255, 0.2) !important; }
    .hover\\:bg-opacity-30:hover { background-color: rgba(255, 255, 255, 0.3) !important; }
    .hover\\:text-gray-300:hover { color: #d1d5db !important; }
    .hover\\:text-gray-400:hover { color: #9ca3af !important; }
    .hover\\:text-gray-600:hover { color: #4b5563 !important; }
    .hover\\:text-gray-900:hover { color: #111827 !important; }
    .hover\\:text-blue-200:hover { color: #bfdbfe !important; }
    .hover\\:text-blue-400:hover { color: #60a5fa !important; }
    .hover\\:text-blue-600:hover { color: #2563eb !important; }
    .hover\\:text-red-600:hover { color: #dc2626 !important; }
    .hover\\:text-gray-200:hover { color: #e5e7eb !important; }
    .hover\\:underline:hover { text-decoration: underline !important; }
    .hover\\:no-underline:hover { text-decoration: none !important; }
    .hover\\:opacity-70:hover { opacity: 0.7 !important; }
    .hover\\:opacity-80:hover { opacity: 0.8 !important; }
    .hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; }
    
    /* Sign-in button glow effect - using same text-shadow as verse letters */
    .sign-in-glow {
      transition: all 0.3s ease !important;
      color: rgba(255,255,255,0.6) !important; /* Dimmer default state */
    }
    
    .sign-in-glow span {
      color: rgba(255,255,255,0.6) !important; /* Ensure span inherits dimmer color */
    }
    
    .sign-in-glow svg {
      opacity: 0.6 !important; /* Dim the icon too */
    }
    
    .sign-in-glow:hover {
      color: rgba(255,255,255,0.8) !important; /* Slightly brighter on hover */
      text-shadow: 0px 0px 25px rgba(255,255,255,1) !important; /* Stronger glow */
      transform: translateY(-1px) !important;
    }
    
    /* Apply glow to all child elements on hover */
    .sign-in-glow:hover * {
      color: rgba(255,255,255,0.8) !important;
      text-shadow: 0px 0px 25px rgba(255,255,255,1) !important;
    }
    
    /* Special handling for the SVG icon */
    .sign-in-glow:hover svg {
      opacity: 0.8 !important;
      filter: drop-shadow(0px 0px 25px rgba(255,255,255,1)) !important;
    }
    
    /* Focus states */
    .focus\\:outline-none:focus { outline: none !important; }
    .focus\\:ring-2:focus { box-shadow: 0 0 0 2px !important; }
    .focus\\:ring-4:focus { box-shadow: 0 0 0 4px !important; }
    .focus\\:ring-white:focus { --tw-ring-color: white !important; }
    .focus\\:ring-blue-300:focus { --tw-ring-color: #93c5fd !important; }
    .focus\\:ring-blue-500:focus { --tw-ring-color: #3b82f6 !important; }
    .focus\\:ring-opacity-50:focus { --tw-ring-opacity: 0.5 !important; }
    .focus\\:border-blue-500:focus { border-color: #3b82f6 !important; }
    
    /* Active states */
    .active\\:bg-gray-100:active { background-color: #f3f4f6 !important; }
    .active\\:bg-gray-200:active { background-color: #e5e7eb !important; }
    .active\\:bg-blue-700:active { background-color: #1d4ed8 !important; }
    
    /* Disabled states */
    .disabled\\:opacity-50:disabled { opacity: 0.5 !important; }
    .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed !important; }
    
    /* Group hover states */
    .group:hover .group-hover\\:text-gray-900 { color: #111827 !important; }
    .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
    
    /* Responsive */
    @media (max-width: 768px) {
      .verse-modal {
        padding: 32px !important;
        width: 95% !important;
      }
      
      .verse-text {
        font-size: 24px !important;
        line-height: 32px !important;
      }
      
      .verse-reference {
        font-size: 18px !important;
        line-height: 24px !important;
      }
      
      .verse-btn {
        padding: 12px 32px !important;
        font-size: 16px !important;
      }
      
      .verse-more-btn {
        padding: 10px 28px !important;
      }
      
      .verse-reference-line.left {
        margin-right: 50px !important;
      }
      
      .verse-reference-line.right {
        margin-left: 50px !important;
      }
      
      .verse-reference-line.animate {
        width: 35% !important;
        max-width: 150px !important;
      }
    }
    
    @media (max-width: 480px) {
      .verse-modal {
        padding: 24px !important;
      }
      
      .verse-text {
        font-size: 20px !important;
        line-height: 28px !important;
      }
      
      .verse-reference {
        font-size: 16px !important;
        line-height: 20px !important;
        padding: 0 15px !important;
      }
      
      .verse-btn {
        padding: 10px 24px !important;
        font-size: 14px !important;
        min-width: 100px !important;
      }
      
      .verse-more-btn {
        padding: 8px 20px !important;
      }
      
      .verse-button-container {
        gap: 12px !important;
      }
      
      .verse-reference-line.left {
        margin-right: 40px !important;
      }
      
      .verse-reference-line.right {
        margin-left: 40px !important;
      }
      
      .verse-reference-line.animate {
        width: 30% !important;
        max-width: 100px !important;
      }
    }
    
    /* Animation classes */
    .animate-slideIn { animation: slideIn 0.3s ease-out !important; }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out !important; }
    
    /* Link styles - prevent background on links */
    a {
      background-color: transparent !important;
      text-decoration: none !important;
    }
    
    /* Ensure proper link button styling */
    a.underline {
      text-decoration: underline !important;
    }
    
    /* Modal link button styles */
    .df-glassmorphism-modal button.text-blue-300,
    .df-glassmorphism-modal a.text-blue-300 {
      background-color: transparent !important;
      color: #93c5fd !important;
    }
    
    /* SVG icon styles */
    svg {
      display: inline-block;
      vertical-align: middle;
      fill: currentColor;
    }
    
    /* Override for inverted user icons */
    .df-icon-inverted {
      fill: #374151 !important;
    }
    
    /* Scrollbar styles for modal */
    .modal-content::-webkit-scrollbar {
      width: 8px;
    }
    
    .modal-content::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
    
    .modal-content::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
    }
    
    .modal-content::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.5);
    }
    
    /* CSS Custom Properties for glassmorphism */
    :host {
      --df-bg-white-10: rgba(255, 255, 255, 0.1);
      --df-bg-white-20: rgba(255, 255, 255, 0.2);
      --df-bg-white-30: rgba(255, 255, 255, 0.3);
      --df-backdrop-blur-sm: blur(4px);
      --df-backdrop-blur-md: blur(12px);
      --df-border-white-20: rgba(255, 255, 255, 0.2);
      --df-border-white-30: rgba(255, 255, 255, 0.3);
    }
    

    /* Auth Form Styles */
    .auth-form-group {
      margin-bottom: 16px !important;
    }

    .auth-label {
      display: block !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      color: white !important;
      margin-bottom: 4px !important;
    }

    .auth-input-wrapper {
      position: relative !important;
      display: flex !important;
      align-items: center !important;
    }

    /* Icon class - commented out since we're not using icons anymore
    .auth-input-icon {
      position: absolute !important;
      left: 12px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      color: rgba(255, 255, 255, 0.7) !important;
      pointer-events: none !important;
      z-index: 1 !important;
    } */

    .auth-input {
      width: 100% !important;
      padding: 8px 12px !important;
      font-size: 16px !important;
      line-height: 24px !important;
      color: white !important;
      background-color: rgba(255, 255, 255, 0.2) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      border-radius: 6px !important;
      outline: none !important;
      transition: all 0.15s !important;
    }


    .auth-input::placeholder {
      color: rgba(255, 255, 255, 0.7) !important;
    }

    .auth-input:focus {
      background-color: rgba(255, 255, 255, 0.25) !important;
      border-color: rgba(255, 255, 255, 0.5) !important;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2) !important;
    }

    .auth-input-error {
      border-color: #f87171 !important;
    }

    .auth-input-error:focus {
      border-color: #f87171 !important;
      box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.3) !important;
    }

    .auth-error-message {
      display: block !important;
      margin-top: 4px !important;
      font-size: 12px !important;
      color: #fca5a5 !important;
    }

    .auth-error-banner {
      display: flex !important;
      align-items: flex-start !important;
      gap: 12px !important;
      padding: 12px !important;
      background-color: rgba(239, 68, 68, 0.2) !important;
      border: 1px solid rgba(248, 113, 113, 0.5) !important;
      border-radius: 6px !important;
      color: #fecaca !important;
      font-size: 14px !important;
    }

    .password-input-wrapper {
      position: relative !important;
    }


    .password-strength {
      margin-top: 4px !important;
      font-size: 12px !important;
      font-weight: 500 !important;
    }

    /* Tailwind utility classes */
    .grid {
      display: grid !important;
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .gap-3 {
      gap: 12px !important;
    }

    .space-y-4 > * + * {
      margin-top: 16px !important;
    }

    .space-y-2 > * + * {
      margin-top: 8px !important;
    }

    .flex {
      display: flex !important;
    }

    .items-center {
      align-items: center !important;
    }

    .justify-center {
      justify-content: center !important;
    }

    .justify-between {
      justify-content: space-between !important;
    }

    .gap-2 {
      gap: 8px !important;
    }

    .relative {
      position: relative !important;
    }

    .absolute {
      position: absolute !important;
    }

    .inset-0 {
      top: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      left: 0 !important;
    }

    .z-10 {
      z-index: 10 !important;
    }

    .w-full {
      width: 100% !important;
    }

    .w-80 {
      width: 320px !important;
    }

    .max-w-sm {
      max-width: 384px !important;
    }

    .text-center {
      text-align: center !important;
    }

    .text-sm {
      font-size: 14px !important;
      line-height: 20px !important;
    }

    .text-lg {
      font-size: 18px !important;
      line-height: 28px !important;
    }

    .font-semibold {
      font-weight: 600 !important;
    }

    .text-white {
      color: white !important;
    }

    .text-blue-300 {
      color: #93c5fd !important;
    }

    .text-blue-200 {
      color: #bfdbfe !important;
    }

    .underline {
      text-decoration: underline !important;
    }

    .mt-4 {
      margin-top: 16px !important;
    }

    .mt-8 {
      margin-top: 32px !important;
    }

    .mb-4 {
      margin-bottom: 16px !important;
    }

    .p-6 {
      padding: 24px !important;
    }

    .py-2 {
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }

    .px-4 {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }

    .rounded {
      border-radius: 4px !important;
    }

    .rounded-lg {
      border-radius: 8px !important;
    }

    .border {
      border-width: 1px !important;
    }

    .border-white {
      border-color: white !important;
    }

    .border-opacity-20 {
      border-color: rgba(255, 255, 255, 0.2) !important;
    }

    .bg-black {
      background-color: black !important;
    }

    .bg-white {
      background-color: white !important;
    }

    .bg-opacity-10 {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }

    .bg-opacity-20 {
      background-color: rgba(255, 255, 255, 0.2) !important;
    }

    .bg-opacity-30 {
      background-color: rgba(255, 255, 255, 0.3) !important;
    }

    .bg-opacity-50 {
      background-color: rgba(0, 0, 0, 0.5) !important;
    }

    .bg-green-600 {
      background-color: #059669 !important;
    }

    .bg-green-700 {
      background-color: #047857 !important;
    }

    .bg-gray-500 {
      background-color: #6b7280 !important;
    }

    .backdrop-blur-md {
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
    }

    .hover\\:bg-green-700:hover {
      background-color: #047857 !important;
    }

    .hover\\:bg-opacity-30:hover {
      background-color: rgba(255, 255, 255, 0.3) !important;
    }

    .hover\\:text-blue-200:hover {
      color: #bfdbfe !important;
    }

    .disabled\\:bg-gray-500:disabled {
      background-color: #6b7280 !important;
    }

    .transition-colors {
      transition-property: background-color, border-color, color, fill, stroke !important;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
      transition-duration: 150ms !important;
    }

    .w-5 {
      width: 20px !important;
    }

    .h-5 {
      height: 20px !important;
    }

    /* Context View Styles */
    .context-view-container {
      position: relative !important;
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }

    .context-header {
      margin-bottom: 16px !important;
      margin-top: 0 !important; /* Remove negative margin to prevent cutoff */
      text-align: center !important;
      flex-shrink: 0 !important;
    }
    
    /* Context title row with translation dropdown */
    .context-title-row {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 16px !important;
      margin-bottom: 12px !important;
    }
    
    /* Context translation dropdown */
    .context-translation-select {
      background-color: rgba(255, 255, 255, 0.1) !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      padding: 6px 12px !important;
      border-radius: 6px !important;
      font-size: 14px !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      outline: none !important;
    }
    
    .context-translation-select:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.2) !important;
      border-color: rgba(255, 255, 255, 0.4) !important;
    }
    
    .context-translation-select:disabled {
      opacity: 0.5 !important;
      cursor: not-allowed !important;
    }
    
    .context-translation-select option {
      background-color: #1a1a1a !important;
      color: white !important;
    }

    .context-title {
      font-size: 32px !important;
      font-weight: 300 !important;
      color: white !important;
      margin-bottom: 12px !important;
    }

    /* Animated underline for context title */
    .context-title-underline {
      width: 0 !important;
      height: 1px !important;
      background-color: rgba(255, 255, 255, 0.3) !important;
      margin: 0 auto 16px auto !important;
      transition: width 0.8s ease-out !important;
    }

    .context-title-underline.animate {
      width: 200px !important;
    }

    .context-subtitle {
      font-size: 20px !important;
      color: rgba(255, 255, 255, 0.8) !important;
      font-style: italic !important;
    }

    /* Scroll container wrapper */
    .context-scroll-container {
      position: relative !important;
      height: 300px !important; /* Smaller height for more compact view */
      overflow: hidden !important;
      margin-bottom: 16px !important;
    }

    .context-content {
      height: 100% !important;
      overflow-y: auto !important;
      padding: 20px !important;
      padding-right: 16px !important; /* Reduced padding for thinner scrollbar */
    }

    /* Scrollbar for context content - thin and subtle */
    .context-content::-webkit-scrollbar {
      width: 4px !important;
    }

    .context-content::-webkit-scrollbar-track {
      background: transparent !important;
    }

    .context-content::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2) !important;
      border-radius: 2px !important;
    }

    .context-content::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3) !important;
    }

    .context-verses {
      position: relative !important;
      padding-bottom: 100px !important; /* Extra space to ensure content isn't hidden by fade */
    }

    .context-paragraph {
      margin-bottom: 16px !important;
      line-height: 1.8 !important;
      color: rgba(255, 255, 255, 0.9) !important;
      font-size: 18px !important;
      text-align: left !important;
    }

    .context-paragraph:last-child {
      margin-bottom: 0 !important;
    }
    
    /* KJV formatting - each verse as separate paragraph */
    .context-paragraph.kjv-verse {
      margin-bottom: 12px !important;
      text-indent: 0 !important;
    }
    
    .context-paragraph.kjv-verse .context-verse-number {
      font-weight: bold !important;
      font-size: inherit !important;
      vertical-align: baseline !important;
      margin-right: 8px !important;
    }

    /* Poetry formatting styles */
    .poetry-q1 {
      padding-left: 2em !important;
      margin-bottom: 0.5em !important;
    }

    .poetry-q2 {
      padding-left: 4em !important;
      margin-bottom: 0.5em !important;
    }

    /* Psalm descriptor/title */
    .psalm-descriptor {
      font-style: italic !important;
      text-align: center !important;
      margin-bottom: 2em !important;
      opacity: 0.9 !important;
      font-size: 0.95em !important;
    }

    /* Poetry line breaks */
    .poetry-break {
      margin-bottom: 1.5em !important;
    }

    /* Superscript verse numbers (for non-KJV formatting) */
    .context-verse-number {
      font-size: 0.75em !important;
      font-weight: 600 !important;
      color: white !important;
      margin-right: 2px !important;
      vertical-align: super !important;
      line-height: 0 !important;
    }

    /* Verse text content */
    .verse-text-content {
      font-size: inherit !important;
      color: inherit !important;
    }

    /* Words of Jesus in red */
    .words-of-jesus {
      color: #ff6b6b !important; /* Light red color for visibility on dark background */
    }

    /* Translator additions in italics */
    .translator-addition {
      font-style: italic !important;
      opacity: 0.9 !important; /* Slightly dimmed to indicate they're additions */
    }

    /* Combined: Words of Jesus that are also translator additions */
    .words-of-jesus.translator-addition {
      color: #ff6b6b !important; /* Keep red color */
      font-style: italic !important; /* Add italic */
      opacity: 1 !important; /* Full opacity for Jesus's words */
    }

    /* Divine name (LORD) in small caps */
    .divine-name {
      font-variant: small-caps !important;
      letter-spacing: 0.05em !important; /* Slight spacing for better readability */
      font-weight: 600 !important; /* Slightly bolder for emphasis */
    }

    /* Highlighted verse inline */
    .highlighted-verse {
      position: relative !important;
    }

    .highlighted-verse .verse-text-content {
      background-color: rgba(255, 255, 255, 0.15) !important;
      padding: 2px 4px !important;
      border-radius: 3px !important;
      color: white !important;
    }

    /* Fade effect at bottom edge */
    .context-fade {
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 80px !important;
      background: linear-gradient(to bottom, 
        rgba(0, 0, 0, 0) 0%, 
        rgba(0, 0, 0, 0.475) 20%, 
        rgba(0, 0, 0, 0.76) 50%, 
        rgba(0, 0, 0, 0.9025) 80%, 
        rgba(0, 0, 0, 0.95) 100%
      ) !important;
      pointer-events: none !important;
      transition: opacity 0.3s ease !important;
      z-index: 2 !important;
    }

    /* Hide fade when scrolled to bottom */
    .context-fade.hidden {
      opacity: 0 !important;
    }

    /* Fixed button container */
    .context-button-fixed {
      position: sticky !important;
      bottom: 0 !important;
      background-color: rgba(0, 0, 0, 0.95) !important;
      padding: 16px 0 0 0 !important;
      text-align: center !important;
      z-index: 10 !important;
      flex-shrink: 0 !important;
    }

    /* Loading state */
    .context-loading {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 200px !important;
      color: rgba(255, 255, 255, 0.7) !important;
      font-size: 18px !important;
    }
    
    /* Loading container */
    .context-loading-container {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      height: 300px !important;
      gap: 20px !important;
    }
    
    /* Loading spinner */
    .context-spinner {
      width: 40px !important;
      height: 40px !important;
      border: 3px solid rgba(255, 255, 255, 0.2) !important;
      border-top-color: rgba(255, 255, 255, 0.8) !important;
      border-radius: 50% !important;
      animation: spin 1s linear infinite !important;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Modal transition states */
    .verse-modal-expanded {
      max-height: 90vh !important;
      transition: all 0.4s ease-out !important;
    }
    
    /* Ensure modal expanded properly manages overflow */
    .verse-modal-expanded .verse-content {
      overflow: visible !important; /* Keep visible for animations */
    }
    
    /* Only hide overflow when showing context */
    .verse-modal-expanded .context-view-container {
      overflow: hidden !important;
    }

    /* Back button for context view */
    .context-back-btn {
      position: absolute !important;
      top: 20px !important;
      left: 20px !important;
      background-color: rgba(255, 255, 255, 0.1) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      padding: 8px 16px !important;
      border-radius: 6px !important;
      font-size: 14px !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }

    .context-back-btn:hover {
      background-color: rgba(255, 255, 255, 0.2) !important;
      transform: translateX(-2px) !important;
    }

    /* ESV-specific formatting */
    .esv-chapter-container {
      position: relative !important;
      margin-bottom: 16px !important;
    }

    .esv-chapter-number {
      float: left !important;
      font-size: 60px !important;
      line-height: 0.8 !important;
      font-weight: 300 !important;
      color: rgba(255, 255, 255, 0.7) !important;
      margin-left: -0.5rem !important;
      margin-right: 12px !important;
      margin-top: -5px !important;
      margin-bottom: -10px !important;
      padding-right: 5px !important;
    }

    .esv-content {
      display: block !important;
    }
    
    /* First paragraph in ESV needs special handling */
    .esv-first-paragraph {
      /* Text will wrap around the floated chapter number */
      text-indent: 0 !important; /* No indent for first paragraph with chapter number */
      display: block !important;
    }

    /* ESV section headings */
    .esv-heading {
      font-style: italic !important;
      font-size: 20px !important;
      color: rgba(255, 255, 255, 0.8) !important;
      margin: 24px 0 16px 0 !important;
      font-weight: 400 !important;
      clear: left !important; /* Clear the floated chapter number */
      text-indent: 0 !important; /* No indent for headings */
      text-align: left !important; /* Left align headings */
    }

    .esv-heading:first-child {
      margin-top: 0 !important;
    }

    /* ESV paragraph formatting */
    .context-paragraph.esv-format {
      text-align: left !important;
      text-indent: 2em !important;
      margin-bottom: 16px !important;
      line-height: 1.8 !important;
    }
    
    /* First paragraph should not be indented (it has the chapter number) */
    .esv-content .context-paragraph.esv-format:first-of-type {
      text-indent: 0 !important;
    }

    /* ESV verse numbers - smaller superscript */
    .esv-format .context-verse-number {
      font-size: 0.65em !important;
      vertical-align: super !important;
      font-weight: 400 !important;
      margin-right: 3px !important;
      opacity: 0.8 !important;
    }
    
    /* First verse in ESV format - hide the "1" since it's part of chapter number */
    .esv-format .context-paragraph:first-of-type .context-verse-number:first-child {
      display: none !important;
    }

    /* Remove ESV format from KJV-style verses */
    .context-paragraph.kjv-verse.esv-format {
      text-align: left !important;
    }

    /* Mobile adjustments for ESV */
    @media (max-width: 768px) {
      .esv-chapter-number {
        font-size: 56px !important;
        margin-right: 16px !important;
        margin-top: -6px !important;
        margin-bottom: -8px !important;
        padding-right: 4px !important;
      }

      .esv-heading {
        font-size: 18px !important;
      }
      
      .context-paragraph.esv-format {
        text-indent: 1.5em !important;
      }
    }

    @media (max-width: 480px) {
      .esv-chapter-number {
        font-size: 48px !important;
        margin-right: 12px !important;
        margin-top: -4px !important;
        margin-bottom: -6px !important;
        padding-right: 3px !important;
      }

      .esv-heading {
        font-size: 16px !important;
      }
      
      .context-paragraph.esv-format {
        text-indent: 1.2em !important;
      }
    }

    /* NLT-specific formatting */
    .nlt-content {
      display: block !important;
      font-family: Georgia, serif !important;
      line-height: 1.6 !important;
    }
    
    .nlt-content .chapter-number {
      float: left !important;
      font-size: 72px !important;
      font-weight: 300 !important;
      line-height: 0.9 !important;
      margin-right: 8px !important;
      margin-top: -8px !important;
      color: #333 !important;
    }
    
    .nlt-content .body, .nlt-content .body-ch {
      text-align: left !important;
      margin-bottom: 12px !important;
    }
    
    .nlt-content .body-ch {
      text-indent: 0 !important;
    }
    
    .nlt-content .body {
      text-indent: 2em !important;
    }
    
    .nlt-content .vn {
      font-size: 0.65em !important;
      vertical-align: super !important;
      font-weight: 600 !important;
      margin-right: 2px !important;
      line-height: 0 !important;
    }
    
    .nlt-content .red {
      color: #d73502 !important;
    }
    
    .nlt-content h2 {
      font-size: 1.1em !important;
      font-style: italic !important;
      font-weight: normal !important;
      margin-top: 20px !important;
      margin-bottom: 10px !important;
      text-align: left !important;
    }
    
    .nlt-content .tn {
      display: none !important; /* Hide footnotes for now */
    }
    
    .nlt-content .a-tn {
      display: none !important; /* Hide footnote markers */
    }
    
    /* NLT first verse with chapter number */
    .nlt-first-verse-content {
      overflow: hidden !important;
    }
    
    .nlt-first-verse-content .esv-heading {
      margin-top: 0 !important;
    }
    
    /* Ensure NLT content uses the same heading styles as ESV */
    .esv-content .esv-heading {
      display: block !important;
      clear: both !important;
    }

    /* ============================================
       PSALM-SPECIFIC STYLES
       ============================================ */
    
    /* Psalm superscription/title */
    .psalm-superscription {
      font-style: italic !important;
      font-size: 1.1em !important;
      color: #a0a0a0 !important;
      margin-bottom: 1.5rem !important;
      text-align: center !important;
      padding: 0 2rem !important;
      line-height: 1.6 !important;
    }
    
    /* Selah marker - right-aligned and italic */
    .selah-marker {
      font-style: italic !important;
      float: right !important;
      margin-left: 2em !important;
      color: #888 !important;
      font-size: 0.9em !important;
    }
    
    /* Clear floats after verses with Selah */
    .verse-with-selah::after {
      content: "" !important;
      display: table !important;
      clear: both !important;
    }
    
    /* Poetry indentation levels */
    .poetry-indent-1 {
      padding-left: 2em !important;
    }
    
    .poetry-indent-2 {
      padding-left: 4em !important;
    }
    
    /* Stanza break - extra spacing between stanzas */
    .stanza-break {
      margin-bottom: 2rem !important;
    }
    
    /* Section headings within Psalms */
    .psalm-section-heading {
      font-weight: 600 !important;
      font-size: 1.1em !important;
      color: #b0b0b0 !important;
      margin-top: 2rem !important;
      margin-bottom: 1rem !important;
      text-align: center !important;
    }
    
    /* Acrostic letter (for Psalms like 119) */
    .acrostic-letter {
      float: left !important;
      font-size: 3em !important;
      line-height: 0.8 !important;
      font-weight: bold !important;
      color: #888 !important;
      margin-right: 0.3em !important;
      margin-top: 0.1em !important;
      font-family: Georgia, serif !important;
    }
    
    /* Speaker labels for dialogue Psalms */
    .speaker-label {
      font-weight: 600 !important;
      font-size: 0.9em !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
      color: #999 !important;
      margin-bottom: 0.5rem !important;
      display: block !important;
    }
    
    /* Musical notation */
    .musical-notation {
      font-style: italic !important;
      font-size: 0.95em !important;
      color: #999 !important;
      text-align: center !important;
      margin-bottom: 1rem !important;
    }
    
    /* Psalm poetry line structure styles */
    .verse-with-lines {
      display: block !important;
      margin-bottom: 0.5rem !important;
    }
    
    .verse-line-wrapper {
      display: flex !important;
      align-items: baseline !important;
      margin-bottom: 0.2rem !important;
    }
    
    .verse-line-wrapper .context-verse-number {
      position: relative !important;
      top: 0 !important;
      margin-right: 0.5rem !important;
      flex-shrink: 0 !important;
      min-width: 1.5em !important;
    }
    
    .verse-line {
      flex: 1 !important;
      line-height: 1.6 !important;
    }
    
    .verse-line.continuation-line {
      padding-left: 2em !important;
    }
    
    /* When verse has lines, don't use paragraph grouping */
    .esv-first-paragraph .verse-with-lines,
    .context-paragraph .verse-with-lines {
      display: block !important;
      margin-bottom: 1rem !important;
    }
    
    /* ESV chapter container adjustments for poetry */
    .esv-chapter-container .verse-with-lines:first-child {
      margin-top: 0 !important;
    }
    
    /* Responsive adjustments for Psalm elements */
    @media (max-width: 768px) {
      .psalm-superscription {
        font-size: 1em !important;
        padding: 0 1rem !important;
      }
      
      .poetry-indent-1 {
        padding-left: 1em !important;
      }
      
      .poetry-indent-2 {
        padding-left: 2em !important;
      }
      
      .acrostic-letter {
        font-size: 2.5em !important;
      }
      
      .verse-line.continuation-line {
        padding-left: 1em !important;
      }
      
      .verse-line-wrapper .context-verse-number {
        min-width: 1.2em !important;
      }
    }

  `;
};