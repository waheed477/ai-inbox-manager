# Fix Plan: useFilteredEmails & Font Errors

## Steps
- [x] 1. Update `frontend/src/data/mockEmails.ts` — add `aiReplySuggestions?: string[]` to `Email` interface.
- [x] 2. Rewrite `frontend/src/store/emailStore.ts` — expand store, implement all missing state/actions, and export `useFilteredEmails` hook.
- [x] 3. Fix `frontend/src/pages/InboxPage.tsx` — remove invalid `onClick` prop from `<EmailRow>`.
- [x] 4. Fix `frontend/index.html` — remove Google Fonts `<link>` tags to eliminate offline error.
- [x] 5. Fix `frontend/src/index.css` — add `font-family` fallback so UI renders correctly offline.
- [x] 6. Fix `frontend/src/components/EmailDetailPane.tsx` — fix optional chaining strict-mode comparison.
- [x] 7. Run TypeScript type-check in `frontend/` — zero errors.

