# Fix NextAuth PrismaAdapter Error - Progress Tracker

## Steps (approved plan):

- [x] 1. Create this TODO.md file ✅
- [x] 2. Update backend/prisma/schema.prisma: Add NextAuth models (Account, Session, VerificationToken), update User model with relations/emailVerified ✅
- [x] 3. Run migrations: cd backend && npx prisma db push && npx prisma generate (schema fixed, push successful despite generate EPERM) ✅
- [x] 4. Update backend/lib/auth.ts: Enhance JWT/session callbacks for user data ✅
- [ ] 5. Restart dev server and test Google OAuth sign-in (check /api/auth/signin, verify no error, docs in Atlas)
- [ ] 6. Complete: Remove this file or mark all ✅

**Current status**: Starting schema updates next.

