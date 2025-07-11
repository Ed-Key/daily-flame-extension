import { VerseData } from '../../types';

// Props interfaces for VerseOverlay components

export interface ProfileDropdownProps {
  user: any; // Firebase User type
  isAdmin: boolean;
  isEmailVerified: boolean;
  onSignOut: () => void;
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
  shadowRoot?: ShadowRoot | null;
  isAdmin?: boolean;
}

export interface ContextViewProps {
  verse: VerseData;
  chapterContent: any; // Chapter content from API
  contextLoading: boolean;
  contextTranslation: string;
  onBack: () => void;
  onDone: () => void;
  onTranslationChange: (translation: string) => void;
}