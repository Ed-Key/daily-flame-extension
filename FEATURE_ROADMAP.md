# DailyFlame Feature Development Roadmap

## Executive Summary

This document outlines the comprehensive feature development plan for DailyFlame Chrome Extension, based on extensive research from 10 specialized AI agents analyzing user psychology, market gaps, spiritual formation, technical implementation, and growth strategies.

### Current State
- Daily verse popup with beautiful GSAP animations
- Chapter context view ("More" button)
- Firebase authentication with user profiles
- Firestore for verse storage
- ESV as default translation (KJV, ASV, WEB also available)
- Shadow DOM implementation for style isolation

### Core User Concerns
1. Verses might not relate to user's current situation
2. Average users don't want to journal/write extensively
3. Need to reduce friction for engagement
4. Want differentiation from existing Bible apps
5. Must respect Holy Spirit's role in understanding Scripture
6. Focus on intentional spiritual growth, not passive reading

## Research Findings Summary

### User Psychology (Digital Habits)
- **Digital fatigue is real** - users are overwhelmed by notifications
- **Micro-engagements work best** - 5-30 second interactions vs 5-minute journaling
- **Context-aware timing** - appearing during natural breaks increases engagement
- **Habit anchoring** - piggyback on existing browser behavior

### Market Analysis (What's Missing)
- No Bible extension offers context-aware verse application
- Lack of privacy-focused spiritual data handling
- Missing scholarly context without interpretation
- No protection against out-of-context verse usage
- Limited personalization options

### Behavioral Science (Engagement)
- **Optimal frequency**: 3-5 touchpoints daily
- **Tiny habits succeed**: < 2 minute practices have high adherence
- **Beauty matters**: Aesthetic experiences enhance spiritual engagement
- **Choice increases commitment**: User control over frequency/timing

### Technical Opportunities
- Leverage existing Chrome APIs (storage, alarms, identity)
- Build on current Firebase/Firestore infrastructure
- Use Shadow DOM for new UI components
- Progressive enhancement approach

## Feature Development Phases

### Phase 1: Foundation Features (Weeks 1-2)

#### 1.1 User Preferences System
**Timeline**: 2-3 days  
**Priority**: Critical  
**Dependencies**: None

**Features**:
- Bible translation preference (ESV, KJV, ASV, WEB)
- Theme selection (light/dark/auto)
- Font size adjustment (small/medium/large)
- Display frequency control (CLARIFIED BEHAVIOR):
  - **Default behavior**: Verse appears on EVERY new tab until "Done" is clicked
  - **Same verse all day**: Daily verse doesn't change, only acknowledgment resets
  - **Scheduled reset times**: User defines times when acknowledgment resets (e.g., 9 AM, 5 PM)
  - **Example flow**: 
    - 9:00 AM - Reset triggers, verse shows on every new tab
    - 9:15 AM - User clicks "Done", verse stops showing
    - 5:00 PM - Reset triggers again, same verse requires re-acknowledgment
  - **Options**:
    - Traditional mode: Once per day (current behavior)
    - Scheduled mode: Multiple acknowledgments at chosen times
- Notification preferences (TO BE IMPLEMENTED LATER)

**Technical Implementation**:
```typescript
// src/services/preferences-service.ts
interface UserPreferences {
  preferredTranslation: BibleTranslation;
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  // Display frequency control with acknowledgment-based behavior
  acknowledgmentSchedule: {
    enabled: boolean; // false = traditional once/day, true = scheduled resets
    resetTimes: string[]; // ['09:00', '17:00'] - times to reset acknowledgment
  };
  // Notifications to be implemented later
}

// Updated storage model for acknowledgment tracking
interface DailyAcknowledgment {
  date: string; // Current date
  acknowledgedPeriods: string[]; // Which time periods have been acknowledged
  // e.g., ['09:00', '17:00'] means user has acknowledged verse for both periods
}

class PreferencesService {
  private static readonly STORAGE_KEY = 'userPreferences';
  
  static async getPreferences(): Promise<UserPreferences> {
    const stored = await chrome.storage.local.get(this.STORAGE_KEY);
    return stored[this.STORAGE_KEY] || this.getDefaultPreferences();
  }
  
  static async savePreferences(prefs: UserPreferences): Promise<void> {
    await chrome.storage.local.set({ [this.STORAGE_KEY]: prefs });
    // Emit event for UI updates
    chrome.runtime.sendMessage({ action: 'preferencesUpdated', preferences: prefs });
  }
}
```

**UI Components**:
- Settings button added to ProfileDropdown component (first step)
- PreferencesModal component with sections for:
  - Theme selection (radio buttons)
  - Bible translation (dropdown)
  - Acknowledgment schedule (toggle + time pickers)
- Time picker for scheduled reset times
- Clear examples/explanations in UI about how acknowledgment works

**Implementation Steps**:
1. Add these settings to ProfileDropdown
2. Create PreferencesModal component
3. Implement PreferencesService for storage
4. Update monitor.ts to check acknowledgment periods
5. Modify verse-app.ts onDismiss to handle period-based acknowledgment
6. Add theme classes to shadow-dom-styles.ts

#### 1.2 Save/Favorite Verses Feature
**Timeline**: 3-4 days  
**Priority**: Critical  
**Dependencies**: User authentication (existing)

**Features**:
- Heart icon on verse display for quick saving
- "My Saved Verses" section in profile dropdown
- Organize saved verses by:
  - Date saved
  - Custom collections
  - Bible book
- Export functionality (TXT, PDF)
- Search within saved verses

**Technical Implementation**:
```typescript
// src/services/saved-verses-service.ts
interface SavedVerse {
  verseReference: string;
  verseText: string;
  translation: string;
  savedAt: number;
  collections: string[];
  personalNote?: string;
  tags?: string[];
}

interface VerseCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  verseCount: number;
}

class SavedVersesService {
  // Local storage for offline access
  static async saveVerse(verse: SavedVerse): Promise<void> {
    const saved = await this.getSavedVerses();
    saved.push(verse);
    await chrome.storage.local.set({ savedVerses: saved });
    
    // Sync to Firestore if authenticated
    if (await AuthService.isAuthenticated()) {
      await FirestoreService.saveUserVerse(verse);
    }
  }
  
  static async getSavedVerses(): Promise<SavedVerse[]> {
    const local = await chrome.storage.local.get('savedVerses');
    return local.savedVerses || [];
  }
}
```

**UI Components**:
- Heart icon with fill animation on save
- Saved verses modal with grid/list view
- Collection manager
- Export dialog

### Phase 2: Enhanced Engagement (Weeks 3-4)

#### 2.1 Verse History & Collections
**Timeline**: 1 week  
**Priority**: High  
**Dependencies**: Save verses feature

**Features**:
- Automatic history of last 30 viewed verses
- Create themed collections:
  - Promises
  - Comfort
  - Wisdom
  - Custom themes
- Share collections (optional)
- Collection templates from popular themes

**Technical Implementation**:
```typescript
// Extend saved-verses-service.ts
interface VerseHistory {
  verseReference: string;
  viewedAt: number;
  timeSpent: number;
  translation: string;
  userMood?: string; // From resonance feature
}

class VerseHistoryService {
  private static readonly MAX_HISTORY = 30;
  
  static async addToHistory(entry: VerseHistory): Promise<void> {
    const history = await this.getHistory();
    history.unshift(entry);
    
    // Maintain max size
    if (history.length > this.MAX_HISTORY) {
      history.pop();
    }
    
    await chrome.storage.local.set({ verseHistory: history });
  }
}
```

#### 2.2 Simple Verse Resonance (Non-AI)
**Timeline**: 1 week  
**Priority**: High  
**Dependencies**: Verse history

**Features**:
- Emotion quick-select after verse display:
  - 😔 Struggling
  - 😊 Grateful
  - 💪 Need Strength
  - 🙏 Seeking
  - ❤️ Feeling Loved
- "God Moment" button for perfect timing
- Monthly recap: "Your Spiritual Journey"
- Pattern recognition (which verses help in which moods)

**Technical Implementation**:
```typescript
// src/services/resonance-service.ts
interface VerseResonance {
  verseReference: string;
  emotion?: string;
  isGodMoment: boolean;
  timestamp: number;
  note?: string; // Optional 2-3 word note
}

class ResonanceService {
  static async recordResonance(resonance: VerseResonance): Promise<void> {
    const resonances = await this.getResonances();
    resonances.push(resonance);
    await chrome.storage.local.set({ verseResonances: resonances });
  }
  
  static async generateMonthlyRecap(): Promise<MonthlyRecap> {
    const resonances = await this.getResonances();
    const lastMonth = resonances.filter(r => 
      r.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000
    );
    
    return {
      totalEngagements: lastMonth.length,
      godMoments: lastMonth.filter(r => r.isGodMoment).length,
      emotionBreakdown: this.analyzeEmotions(lastMonth),
      topResonatingVerses: this.getTopVerses(lastMonth)
    };
  }
}
```

### Phase 3: Study Enhancement (Weeks 5-8)

#### 3.1 AI-Powered Study Notes
**Timeline**: 3-4 weeks  
**Priority**: Medium  
**Dependencies**: All previous features

**Features**:
- Four-part study notes for each verse/passage:
  1. Historical & Cultural Context
  2. Theological & Symbolic Meaning
  3. Cross-References
  4. Personal Application
- Progressive disclosure UI
- Offline caching of generated notes
- Quality control system

**Detailed Implementation Plan**:

##### 3.1.1 Data Models
```typescript
// src/types/study-notes.ts
interface StudyNote {
  id: string;
  verseReference: string;
  passageText: string;
  historicalContext: string;
  theologicalMeaning: string;
  crossReferences: CrossReference[];
  personalApplication: string;
  generatedAt: number;
  reviewStatus: 'pending' | 'approved' | 'flagged';
  version: number;
}

interface CrossReference {
  reference: string;
  text: string;
  connection: string;
}

interface Pericope {
  startVerse: string;
  endVerse: string;
  theme: string;
  verseCount: number;
}
```

##### 3.1.2 AI Integration Service
```typescript
// src/services/study-notes-ai-service.ts
class StudyNotesAIService {
  private static readonly MASTER_PROMPT = `
    You are a Commentary Synthesizer providing scholarly context for Bible study.
    You do NOT interpret spiritual meaning but organize existing scholarship.
    
    For passage: {reference}
    Text: {passageText}
    
    Generate study notes with these EXACT sections:
    
    1. HISTORICAL & CULTURAL CONTEXT (2-3 sentences):
    - Ancient customs, locations, or terms modern readers wouldn't know
    - Historical background relevant to understanding the passage
    - No spiritual interpretation, only factual context
    
    2. THEOLOGICAL & SYMBOLIC MEANING (2-3 sentences):
    - What established scholarship says about theological themes
    - Recognized symbolism based on biblical scholarship
    - How this reveals God's character according to commentaries
    
    3. CROSS-REFERENCES (2 references):
    - Reference: [Book Chapter:Verse]
    - Connection: [One sentence explaining the relationship]
    
    4. PERSONAL APPLICATION (1-2 sentences):
    - A thought-provoking question or observation
    - Help readers consider how timeless truths apply today
    - Avoid prescriptive commands; use reflective language
    
    Maintain an educational, reverent tone. Present information, not interpretation.
  `;
  
  static async generateNotes(reference: string, text: string): Promise<StudyNote> {
    // Detect logical passage boundaries
    const pericope = await this.detectPericope(reference, text);
    
    // Check cache first
    const cached = await FirestoreService.getCachedStudyNote(pericope);
    if (cached && this.isFresh(cached)) return cached;
    
    // Generate new notes
    const prompt = this.MASTER_PROMPT
      .replace('{reference}', pericope.startVerse + '-' + pericope.endVerse)
      .replace('{passageText}', text);
    
    const response = await this.callAI(prompt);
    const parsed = this.parseAIResponse(response);
    
    // Validate and store
    const validated = await StudyNoteValidator.validate(parsed);
    if (validated.isValid) {
      await FirestoreService.cacheStudyNote(parsed);
    }
    
    return parsed;
  }
  
  private static async detectPericope(reference: string, text: string): Promise<Pericope> {
    // Smart passage detection based on book type and content
    const book = this.extractBook(reference);
    const bookType = this.getBookType(book); // gospel, epistle, wisdom, etc.
    
    switch(bookType) {
      case 'gospel':
        return this.detectGospelPericope(reference, text);
      case 'epistle':
        return this.detectEpistlePericope(reference, text);
      default:
        return this.defaultPericope(reference);
    }
  }
}
```

##### 3.1.3 Quality Control System
```typescript
// src/services/study-note-validator.ts
class StudyNoteValidator {
  static async validate(note: StudyNote): Promise<ValidationResult> {
    const checks = [
      this.checkStructure(note),      // All required sections present
      this.checkLength(note),          // Within character limits
      this.checkBiblicalAccuracy(note), // Valid verse references
      this.checkTone(note),            // Appropriate language
      this.checkTheology(note)         // No heretical content
    ];
    
    const issues = checks.filter(c => !c.passed);
    
    return {
      isValid: issues.length === 0,
      issues: issues,
      score: this.calculateQualityScore(checks)
    };
  }
  
  private static checkTheology(note: StudyNote): ValidationCheck {
    // Flag potentially problematic theological statements
    const problematicPhrases = [
      'the Bible says you must',
      'God will punish',
      'earn salvation',
      // ... more phrases to check
    ];
    
    const found = problematicPhrases.filter(phrase => 
      note.theologicalMeaning.toLowerCase().includes(phrase) ||
      note.personalApplication.toLowerCase().includes(phrase)
    );
    
    return {
      passed: found.length === 0,
      message: found.length > 0 ? `Problematic phrases found: ${found.join(', ')}` : 'OK'
    };
  }
}
```

##### 3.1.4 UI Integration
```typescript
// src/components/VerseOverlay/components/StudyNotes.tsx
interface StudyNotesProps {
  reference: string;
  show: boolean;
  onClose: () => void;
}

const StudyNotes: React.FC<StudyNotesProps> = ({ reference, show, onClose }) => {
  const [notes, setNotes] = useState<StudyNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  
  useEffect(() => {
    if (show && !notes) {
      loadNotes();
    }
  }, [show]);
  
  const loadNotes = async () => {
    setLoading(true);
    try {
      const studyNotes = await StudyNotesAIService.generateNotes(reference);
      setNotes(studyNotes);
    } catch (error) {
      console.error('Failed to load study notes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`study-notes-panel ${show ? 'show' : ''}`}>
      <button className="close-btn" onClick={onClose}>×</button>
      
      {loading ? (
        <div className="loading">Loading study notes...</div>
      ) : notes ? (
        <>
          <CollapsibleSection 
            title="Historical Context" 
            icon="🏛️"
            expanded={expanded.includes('historical')}
            onToggle={() => toggleSection('historical')}
          >
            <p>{notes.historicalContext}</p>
          </CollapsibleSection>
          
          <CollapsibleSection 
            title="Theological Insights" 
            icon="✨"
            expanded={expanded.includes('theological')}
            onToggle={() => toggleSection('theological')}
          >
            <p>{notes.theologicalMeaning}</p>
          </CollapsibleSection>
          
          <CollapsibleSection 
            title="Cross References" 
            icon="🔗"
            expanded={expanded.includes('references')}
            onToggle={() => toggleSection('references')}
          >
            {notes.crossReferences.map(ref => (
              <CrossReferenceLink 
                key={ref.reference}
                reference={ref.reference}
                connection={ref.connection}
                onClick={() => loadVerseInContext(ref.reference)}
              />
            ))}
          </CollapsibleSection>
          
          <CollapsibleSection 
            title="Personal Reflection" 
            icon="💭"
            expanded={expanded.includes('application')}
            onToggle={() => toggleSection('application')}
          >
            <p className="reflection-prompt">{notes.personalApplication}</p>
          </CollapsibleSection>
        </>
      ) : (
        <div className="error">Unable to load study notes</div>
      )}
    </div>
  );
};
```

## UI/UX Redesign for Enhanced Features

### Current Flow
```
Verse Display → "More" → Chapter Context → "Done"
```

### Enhanced Flow
```
Verse Display → Action Bar
                ├── ❤️ Save
                ├── 📖 More Options
                │   ├── Read Chapter
                │   ├── Study Notes
                │   └── Cross References
                ├── 😊 How I Feel
                └── ✨ God Moment
```

### Progressive Disclosure Principle
1. **Level 1**: Just the verse (current)
2. **Level 2**: Quick actions (save, mood)
3. **Level 3**: Deep study (notes, context)
4. **Level 4**: Personal features (collections, history)

## Technical Architecture Considerations

### Performance Optimization
```typescript
// Caching strategy
class CacheService {
  private static readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  static async get<T>(key: string): Promise<T | null> {
    const cached = await chrome.storage.local.get(key);
    if (!cached[key]) return null;
    
    const { data, timestamp } = cached[key];
    if (Date.now() - timestamp > this.CACHE_DURATION) {
      await chrome.storage.local.remove(key);
      return null;
    }
    
    return data;
  }
  
  static async set<T>(key: string, data: T): Promise<void> {
    await chrome.storage.local.set({
      [key]: {
        data,
        timestamp: Date.now()
      }
    });
  }
}
```

### Privacy & Security
```typescript
// Encryption for sensitive data
class EncryptionService {
  private static async deriveKey(password: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode('dailyflame-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  static async encrypt(text: string, password: string): Promise<string> {
    const key = await this.deriveKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(text)
    );
    
    // Combine iv and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }
}
```

## Success Metrics & Analytics

### User Engagement Metrics
- **Depth Metrics** (Quality over Quantity):
  - Average time spent with verse
  - Study notes accessed per user
  - Verses saved per week
  - Collections created
  
- **Retention Metrics**:
  - 7-day retention rate
  - 30-day retention rate
  - Return after break rate
  
- **Spiritual Growth Indicators**:
  - Verse variety (different books accessed)
  - Study depth progression
  - Sharing/testimony features used

### Technical Metrics
- Page load impact (< 50ms target)
- Memory usage (< 50MB)
- API response times
- Cache hit rates

## Testing Strategy

### Unit Tests
```typescript
// Example test for preferences service
describe('PreferencesService', () => {
  beforeEach(() => {
    chrome.storage.local.clear();
  });
  
  it('should return default preferences when none stored', async () => {
    const prefs = await PreferencesService.getPreferences();
    expect(prefs.preferredTranslation).toBe('ESV');
    expect(prefs.theme).toBe('auto');
  });
  
  it('should save and retrieve preferences', async () => {
    const testPrefs: UserPreferences = {
      preferredTranslation: 'KJV',
      theme: 'dark',
      fontSize: 'large',
      displayFrequency: 'scheduled',
      scheduledTimes: ['09:00', '17:00']
    };
    
    await PreferencesService.savePreferences(testPrefs);
    const retrieved = await PreferencesService.getPreferences();
    
    expect(retrieved).toEqual(testPrefs);
  });
});
```

### Integration Tests
- Test verse display with different preferences
- Verify save/sync functionality
- Test offline mode behavior
- Validate AI response parsing

### User Acceptance Testing
- Beta test with small group from church
- A/B test new features
- Collect feedback on study notes accuracy
- Monitor performance metrics

## Rollout Strategy

### Phase 1 Beta (Weeks 1-2)
- Internal testing team (5-10 users)
- Focus on preferences and save features
- Daily feedback collection

### Phase 2 Limited Release (Weeks 3-4)
- Church partner beta (50-100 users)
- Add resonance features
- Weekly surveys

### Phase 3 Public Beta (Weeks 5-8)
- Open beta with feedback widget
- Study notes for popular passages only
- Performance monitoring

### Phase 4 Full Release (Week 9+)
- Marketing through church partners
- Feature announcement
- Migration support for existing users

## Risk Mitigation

### Technical Risks
- **AI API Costs**: Cache aggressively, pre-generate popular passages
- **Performance Impact**: Lazy load features, use web workers
- **Data Loss**: Regular backups, export functionality

### User Experience Risks
- **Feature Overload**: Progressive disclosure, smart defaults
- **Privacy Concerns**: Clear data policies, local-first approach
- **Theological Accuracy**: Review process, user flagging system

## Future Considerations

### Potential Features (Post-Launch)
1. **Voice Integration**: Audio verse reading and voice notes
2. **Smart Reminders**: Context-aware verse suggestions
3. **Community Features**: Anonymous prayer sharing
4. **Church Integration**: Sync with sermon series
5. **Mobile Companion**: Progressive web app

### Scaling Considerations
- Move to dedicated backend for AI processing
- Implement CDN for static assets
- Consider native app development
- Explore partnerships with Bible publishers

## Conclusion

This roadmap transforms DailyFlame from a simple verse display extension into a comprehensive spiritual growth tool while maintaining its core simplicity and reverence. By implementing features in phases, we ensure each addition provides genuine value without overwhelming users.

The key to success is balancing powerful features with effortless interaction, always keeping the user's spiritual journey at the center of every decision.