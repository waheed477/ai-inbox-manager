# MongoDB Migration from Prisma - Progress Tracker

## Steps to Complete:

### 1. [x] Update package.json
- Update @types/mongodb to ^6.0.1

### 2. [x] Enhance backend/lib/mongodb.ts\n- Add getDb() helper

### 3. [x] Create backend/lib/db.ts\n- User functions: getUserById, updateUserTokens, upsertUser

### 4. [x] Complete backend/lib/adapter.ts\n- Full Adapter implementation with all methods\n- Proper types\n- Indexes creation\n- Error handling

### 5. [x] Update backend/lib/gmail.ts\n- Replace prisma with db functions\n- Handle accessToken, refreshToken, tokenExpiry

### 6. [x] Update backend/lib/auth.ts\n- Switch to database session strategy\n- Pass client to adapter

### 7. [x] Delete backend/lib/prisma.ts

### 8. [x] Test Setup\n- PowerShell commands provided below

**Instructions:** Mark steps as [x] when completed. Run `npx next dev` after major changes to test.
