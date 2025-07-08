import React, { useState, useEffect } from 'react';
import { VerseData, BIBLE_VERSIONS, BibleTranslation } from '../../../types';
import { VerseService } from '../../../services/verse-service';
import { useToast } from '../../ToastContext';
import { AdminControlsProps } from '../types';

const AdminControls: React.FC<AdminControlsProps> = ({ onVerseChange }) => {
  const { showToast } = useToast();
  const [todaysVerse, setTodaysVerse] = useState<{ reference: string; date: string } | null>(null);
  const [nextVerses, setNextVerses] = useState<Array<{ reference: string; date: string }>>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [nextUpdate, setNextUpdate] = useState<string | null>(null);

  useEffect(() => {
    fetchVerseSchedule();
  }, []);

  const fetchVerseSchedule = async () => {
    setAdminLoading(true);
    setAdminError(null);

    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Fetch verse data from GitHub Pages
      const response = await fetch('https://ed-key.github.io/daily-flame-extension/verses.json');
      
      if (!response.ok) {
        throw new Error('Failed to fetch verse schedule');
      }
      
      const data = await response.json();
      
      // Find today's verse
      const todayVerse = data.verses.find((v: any) => v.date === todayStr);
      if (todayVerse) {
        setTodaysVerse({
          reference: todayVerse.reference,
          date: todayVerse.date
        });
      }
      
      // Get next 7 days of verses
      const upcoming = [];
      for (let i = 1; i <= 7; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        const futureDateStr = futureDate.toISOString().split('T')[0];
        
        const futureVerse = data.verses.find((v: any) => v.date === futureDateStr);
        if (futureVerse) {
          upcoming.push({
            reference: futureVerse.reference,
            date: futureVerse.date
          });
        }
      }
      setNextVerses(upcoming);
      
      // Set update info
      if (data.lastUpdated) {
        setLastUpdated(new Date(data.lastUpdated).toLocaleDateString());
      }
      if (data.nextUpdate) {
        setNextUpdate(new Date(data.nextUpdate).toLocaleDateString());
      }
      
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to load verse schedule');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="df-glassmorphism-modal mb-8 p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg backdrop-blur-sm">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📅</span>
        YouVersion Verse Calendar
      </h3>
      
      <div className="space-y-4">
        {adminLoading && (
          <div className="text-white text-center py-4">
            Loading verse schedule...
          </div>
        )}
        
        {adminError && (
          <div className="p-2 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded text-red-200 text-sm">
            {adminError}
          </div>
        )}
        
        {!adminLoading && !adminError && (
          <>
            {/* Today's Verse */}
            {todaysVerse && (
              <div className="p-3 bg-green-500 bg-opacity-20 border border-green-400 border-opacity-50 rounded">
                <h4 className="text-green-100 font-semibold mb-1">Today's Verse</h4>
                <p className="text-white font-medium">
                  {todaysVerse.reference}
                </p>
                <p className="text-green-200 text-sm mt-1">
                  {new Date(todaysVerse.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}
            
            {/* Upcoming Verses */}
            {nextVerses.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Upcoming Verses</h4>
                {nextVerses.map((verse, index) => (
                  <div key={index} className="p-2 bg-white bg-opacity-10 rounded text-white text-sm">
                    <span className="font-medium">{verse.reference}</span>
                    <span className="text-white text-opacity-70 ml-2">
                      - {new Date(verse.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Update Info */}
            <div className="text-white text-opacity-70 text-xs space-y-1 pt-2 border-t border-white border-opacity-20">
              {lastUpdated && (
                <p>Last updated: {lastUpdated}</p>
              )}
              {nextUpdate && (
                <p>Next update: {nextUpdate}</p>
              )}
              <p className="text-white text-opacity-50">
                Verses rotate on a 90-day cycle from YouVersion
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminControls;