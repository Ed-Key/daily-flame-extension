import React, { useState } from 'react';
import { VerseData, BIBLE_VERSIONS, BibleTranslation } from '../../../types';
import { VerseService } from '../../../services/verse-service';
import { useToast } from '../../ToastContext';
import { AdminControlsProps } from '../types';

const AdminControls: React.FC<AdminControlsProps> = ({ onVerseChange }) => {
  const { showToast } = useToast();
  const [adminReference, setAdminReference] = useState('');
  const [adminTranslation, setAdminTranslation] = useState<BibleTranslation>('KJV');
  const [adminPreviewVerse, setAdminPreviewVerse] = useState<VerseData | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleAdminPreview = async () => {
    if (!adminReference || !adminTranslation) {
      setAdminError('Please enter a Bible reference and select a translation');
      return;
    }

    setAdminLoading(true);
    setAdminError(null);
    setAdminPreviewVerse(null);

    try {
      const previewVerse = await VerseService.getVerse(adminReference, BIBLE_VERSIONS[adminTranslation]);
      setAdminPreviewVerse(previewVerse);
      
      // If callback provided, notify parent of verse change
      if (onVerseChange) {
        onVerseChange(previewVerse);
      }
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to load verse');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="df-glassmorphism-modal mb-8 p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg backdrop-blur-sm">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <span>⚙️</span>
        Admin: Set Daily Verse
      </h3>
      
      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={adminReference}
            onChange={(e) => setAdminReference(e.target.value)}
            placeholder="e.g., John 3:16, Psalms 23:1-3"
            className="df-glassmorphism-input flex-1 px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          />
          <select
            value={adminTranslation}
            onChange={(e) => setAdminTranslation(e.target.value as BibleTranslation)}
            className="df-glassmorphism-input px-3 py-2 rounded bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            <option value="KJV" className="text-black">KJV</option>
            <option value="ASV" className="text-black">ASV</option>
            <option value="ESV" className="text-black">ESV</option>
            <option value="WEB" className="text-black">WEB</option>
            <option value="WEB_BRITISH" className="text-black">WEB British</option>
            <option value="WEB_UPDATED" className="text-black">WEB Updated</option>
          </select>
          <button
            onClick={handleAdminPreview}
            disabled={adminLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded transition-colors"
          >
            {adminLoading ? 'Loading...' : 'Preview'}
          </button>
        </div>
        
        {adminError && (
          <div className="p-2 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded text-red-200 text-sm">
            {adminError}
          </div>
        )}
        
        {adminPreviewVerse && (
          <div className="p-3 bg-yellow-500 bg-opacity-20 border border-yellow-400 border-opacity-50 rounded">
            <p className="text-yellow-100 italic mb-2">
              Preview: "{adminPreviewVerse.text}"
            </p>
            <p className="text-yellow-200 font-medium text-sm">
              {adminPreviewVerse.reference} ({adminTranslation})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminControls;