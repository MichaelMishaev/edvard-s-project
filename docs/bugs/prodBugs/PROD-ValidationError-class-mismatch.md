# PROD BUG: ValidationError - Invalid class name

**Error Hash:** class-val-mismatch
**Detected:** 2026-03-10 (User screenshot)
**Source:** User report with screenshot
**Severity:** HIGH
**Status:** FIXED ✅

## Error Details
- **Type:** ValidationError
- **Message:** "Invalid class name"
- **Location:** Player registration (POST /api/players)
- **User Impact:** Users selecting Grade 4 (דלת) cannot start game

## Screenshot Evidence
User screenshot showed:
- Game screen with class selector
- Error message "Invalid class name" displayed in red
- User had selected grade level and class number
- Error appeared during game initialization

## Root Cause Analysis

**Frontend-Backend Mismatch:**
- **Frontend** (`client/src/lib/constants.ts` + `ClassSelector.tsx`):
  - Supports grades: `dalet` (ד׳), `heh` (ה׳), `vav` (ו׳)
  - Allows class IDs: `dalet1`, `dalet2`, `dalet3`, `dalet4`, `heh1-4`, `vav1-4`

- **Backend** (`server/src/config/classes.ts`):
  - Originally only supported: `heh1-4`, `vav1-4`
  - Missing: `dalet1-4` (Grade 4)

**Validation Flow:**
1. User selects "כיתה ד׳" (Grade 4) in ClassSelector
2. Frontend sends `className: "dalet1"` to POST /api/players
3. Backend checks `isValidClass("dalet1")` → returns `false`
4. Backend responds with 400 error: "Invalid class name"
5. Frontend displays error to user

## Fix Applied

Updated `server/src/config/classes.ts` to include Grade 4:

```typescript
export const CLASSES = [
  { id: "dalet1", label: "ד׳1" },
  { id: "dalet2", label: "ד׳2" },
  { id: "dalet3", label: "ד׳3" },
  { id: "dalet4", label: "ד׳4" },
  { id: "heh1", label: "ה׳1" },
  { id: "heh2", label: "ה׳2" },
  { id: "heh3", label: "ה׳3" },
  { id: "heh4", label: "ה׳4" },
  { id: "vav1", label: "ו׳1" },
  { id: "vav2", label: "ו׳2" },
  { id: "vav3", label: "ו׳3" },
  { id: "vav4", label: "ו׳4" },
] as const;
```

## Files Modified
- ✅ `server/src/config/classes.ts` - Added dalet1-4 classes

## Testing Checklist
- [ ] Verify Grade 4 students can register successfully
- [ ] Verify Grade 5 students still work (regression test)
- [ ] Verify Grade 6 students still work (regression test)
- [ ] Check class leaderboards display Grade 4 correctly
- [ ] Test invalid class names still get rejected properly

## Deployment Notes
- No database migration required
- Restart backend server to load new class configuration
- Frontend already supports this - no changes needed

## Prevention
- **Add validation tests** - Frontend and backend class lists should be validated in CI/CD
- **Shared constants** - Consider moving CLASSES to a shared package to prevent drift
- **API contract tests** - Add tests that validate frontend constants match backend validation

## Related Issues
- None known

## Status: FIXED
**Fixed by:** Claude (2026-03-10)
**Deployed:** Pending (local fix applied)
**Next step:** Deploy to production after testing
