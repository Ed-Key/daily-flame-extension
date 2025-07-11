// Bible API types
export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
}

export interface VerseData {
  text: string;
  reference: string;
  bibleId: string;
}

export interface StoredVerse {
  reference: string;
  bibleId: string;
  translation: string;
  dateAdded: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PassageResponse {
  id: string;
  orgId: string;
  bibleId: string;
  bookId: string;
  chapterId: string;
  content: string;
  reference: string;
  verseCount: number;
}

// Chrome extension message types
export interface ChromeMessage {
  action: string;
  [key: string]: any;
}

export interface ChromeResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

// Component props types
export interface VerseOverlayProps {
  verse: VerseData;
  onDismiss: (permanent?: boolean) => void;
  shadowRoot?: ShadowRoot;
}

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Keep AdminModalProps for backward compatibility
export interface AdminModalProps extends UserModalProps {}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

// Firebase Auth types
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL?: string | null;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  isLoading: boolean;
  isSigningIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  isAdmin: boolean;
  isEmailVerified: boolean;
}

// Bible translation mappings
export const BIBLE_VERSIONS = {
  'KJV': 'de4e12af7f28f599-02',
  'ASV': '06125adad2d5898a-01',
  'ESV': 'ESV', // Special case - uses different API
  'NLT': 'NLT', // Special case - uses different API
  'WEB': '9879dbb7cfe39e4d-04', 
  'WEB_BRITISH': '7142879509583d59-04',
  'WEB_UPDATED': '72f4e6dc683324df-03'
} as const;

export type BibleTranslation = keyof typeof BIBLE_VERSIONS;

// Export unified Bible format types
export * from './bible-formats';