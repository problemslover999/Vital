# Security Specification for Vital

## 1. Data Invariants
- A Routine must belong to the authenticated user (`userId == auth.uid`).
- A Progress record date must match its ID for consistency in lookups.
- Messages role must be either 'user' or 'model'.
- Only the owner can read or write their data.

## 2. The Dirty Dozen Payloads
1. Attempt to create a routine for a different user ID.
2. Attempt to read another user's progress records.
3. Attempt to update a routine's `userId` (immutable).
4. Attempt to inject a 2MB string into routine `description`.
5. Attempt to set `streak` to -500.
6. Attempt to create a message with an invalid role (e.g., 'admin').
7. Attempt to list all users' routines.
8. Attempt to modify `createdAt` on an existing routine.
9. Attempt to delete another user's profile.
10. Attempt to spoof `email_verified` (rules must check `auth.token.email_verified`).
11. Attempt to write to `/admins` collection (if it existed, which it doesn't).
12. Attempt to create a user profile with an ID that doesn't match the auth UID.

## 3. Test Cases (Summary)
- `get /users/otherUid` -> Denied
- `create /users/myUid/routines/1` with `userId: otherUid` -> Denied
- `update /users/myUid/routines/1` modifying `createdAt` -> Denied
- `list /users/myUid/routines` -> Allowed if owner
- `list /users/otherUid/routines` -> Denied
