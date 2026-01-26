# Testing Documentation

Manual and automated testing procedures for Daily Bread.

## Test Files

| File | Purpose |
|------|---------|
| `firebase-sync.md` | Preference sync between local storage and Firestore |

## Running Automated Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Manual Testing Checklist

### Core Functionality
- [ ] Verse displays on new tab
- [ ] "Done" button dismisses verse for the day
- [ ] "More" button opens chapter context view
- [ ] Translation dropdown changes verse text

### Authentication
- [ ] Email/password sign up with verification email
- [ ] Email/password sign in
- [ ] Google OAuth sign in
- [ ] Sign out clears auth state
- [ ] Re-sign in after sign out works (no popup errors)

### Preferences
- [ ] Theme toggle persists across sessions
- [ ] Translation preference persists
- [ ] Preferences sync to Firebase when signed in
- [ ] Preferences load from Firebase on new device

### Visual/Animation
- [ ] Modal entrance animation plays
- [ ] Letter-by-letter verse animation
- [ ] Settings sidebar slides in/out
- [ ] Theme switch is instant (CSS variables)

## Adding New Tests

1. Place unit tests in `__tests__/` directories near the code
2. Document manual test procedures in this folder
3. Update this README with new test file entries
