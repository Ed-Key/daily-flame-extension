import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from '../components/AuthContext';
import { BIBLE_VERSIONS, BibleTranslation, VerseData } from '../types';
import { VerseService } from '../services/verse-service';
import '../styles/globals.css';

const AdminPage: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [reference, setReference] = useState('');
  const [translation, setTranslation] = useState<BibleTranslation>('KJV');
  const [previewVerse, setPreviewVerse] = useState<VerseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handlePreview = async () => {
    if (!reference || !translation) {
      setError('Please enter a Bible reference and select a translation');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPreviewVerse(null);

    try {
      const verse = await VerseService.getVerse(reference, BIBLE_VERSIONS[translation]);
      setPreviewVerse(verse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleTestVerse = async () => {
    try {
      setIsLoading(true);
      // Clear the daily status so the verse will show again
      await new Promise<void>((resolve) => {
        chrome.runtime.sendMessage({ action: 'clearStorage' }, () => {
          resolve();
        });
      });
      alert('Daily status reset! The verse overlay will appear on your next page visit.');
    } catch (error) {
      alert('Error resetting daily status');
    } finally {
      setIsLoading(false);
    }
  };

  const AuthModal = () => {
    const { signIn, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const handleEmailSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!email || !password) {
        setAuthError('Please enter both email and password');
        return;
      }

      setAuthLoading(true);
      setAuthError(null);

      try {
        await signIn(email, password);
        setShowAuthModal(false);
      } catch (err: any) {
        setAuthError(err.message || 'Failed to sign in');
      } finally {
        setAuthLoading(false);
      }
    };

    const handleGoogleSignIn = async () => {
      setAuthLoading(true);
      setAuthError(null);

      try {
        await signInWithGoogle();
        setShowAuthModal(false);
      } catch (err: any) {
        setAuthError(err.message || 'Failed to sign in with Google');
      } finally {
        setAuthLoading(false);
      }
    };

    if (!showAuthModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Admin Sign In</h2>
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={authLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={authLoading}
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                <p className="text-red-700 text-sm">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="my-4 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {authLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🔥</span>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Daily Bread Admin</h1>
                <p className="text-gray-600">Manage your daily Bible verses</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <span className="text-sm text-gray-600">
                    {user.email} {isAdmin && '(Admin)'}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>

          {!user ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">Admin access required</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : !isAdmin ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Admin access denied</p>
              <p className="text-sm text-gray-500">Your account does not have admin privileges</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Testing Section */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Testing</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Reset the daily verse status to test the overlay again.
                </p>
                <button
                  onClick={handleTestVerse}
                  disabled={isLoading}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? 'Resetting...' : 'Reset Daily Status'}
                </button>
              </div>

              {/* Verse Preview Section */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Verse Preview Tool</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="verse-reference" className="block text-sm font-medium text-gray-700 mb-2">
                      Bible Reference
                    </label>
                    <input
                      id="verse-reference"
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g., John 3:16, Psalms 23:1-3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Examples: John 3:16, Romans 8:28, Psalms 23:1-6
                    </p>
                  </div>

                  <div>
                    <label htmlFor="bible-translation" className="block text-sm font-medium text-gray-700 mb-2">
                      Translation
                    </label>
                    <select
                      id="bible-translation"
                      value={translation}
                      onChange={(e) => setTranslation(e.target.value as BibleTranslation)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="KJV">KJV - King James Version</option>
                      <option value="WEB">WEB - World English Bible</option>
                      <option value="WEB_BRITISH">WEB British - World English Bible (British)</option>
                      <option value="WEB_UPDATED">WEB Updated - World English Bible (Updated)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handlePreview}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Preview Verse'}
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {previewVerse && (
                  <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="italic text-gray-700 mb-3 text-lg leading-relaxed">
                      "{previewVerse.text}"
                    </div>
                    <div className="font-medium text-gray-800">
                      {previewVerse.reference} ({translation})
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AdminPage />
    </AuthProvider>
  );
};

// Initialize the React app
const container = document.getElementById('admin-root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}