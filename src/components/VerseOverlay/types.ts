import { VerseData, BibleTranslation } from '../../types';

// Props interfaces for VerseOverlay components

export interface ProfileDropdownProps {
  user: any; // Firebase User type
  isAdmin: boolean;
  isEmailVerified: boolean;
  onSignOut: () => void;
  onSettingsClick?: () => void;
  shadowRoot?: ShadowRoot | null;
}

export interface AdminControlsProps {
  onVerseChange?: (verse: VerseData) => void;
}

export interface AuthButtonsProps {
  onSignInClick: () => void;
}

export interface VerseDisplayProps {
  verse: VerseData;
  onDone: () => void;
  onMore: () => void;
  onTranslationChange?: (translation: BibleTranslation) => void;
  shadowRoot?: ShadowRoot | null;
  isAdmin?: boolean;
}

export interface DebugFixture {
  reference: string;
  html: string;
  error?: string;
}

export interface DebugModeState {
  enabled: boolean;
  fixtures: Record<string, Record<string, DebugFixture>> | null;
  currentCategory: string;
  currentChapterKey: string;
  allChapters: Array<{ category: string; key: string; reference: string }>;
  currentIndex: number;
}

export interface ContextViewProps {
  verse: VerseData;
  chapterContent: any; // Chapter content from API
  contextLoading: boolean;
  contextTranslation: string;
  onBack: () => void;
  onDone: () => void;
  onTranslationChange: (translation: string) => void;
  // Debug mode props
  debugMode?: DebugModeState;
  onToggleDebugMode?: () => void;
  onDebugPrev?: () => void;
  onDebugNext?: () => void;
}

export interface ThemeToggleProps {
  theme?: 'light' | 'dark';
  onToggle: () => void;
}