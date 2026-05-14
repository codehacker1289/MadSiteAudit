# Security Specification for AuditAI

## Data Invariants
- An audit report must have a valid `url`, `timestamp`, and `overallScore`.
- A report must be associated with a user ID.
- Users can only read and write their own reports.

## The Dirty Dozen Payloads
1. Unauthorized read of another user's report (Should be DENIED).
2. Creating a report for another user by spoofing `userId` (Should be DENIED).
3. Updating the `url` of an existing report (Should be DENIED).
4. Updating the `overallScore` of an existing report (Should be DENIED).
5. Deleting a report by a non-owner (Should be DENIED).
6. Missing required fields in report creation (Should be DENIED).
7. Invalid URL characters (Should be DENIED).
8. Overly large summary string (Should be DENIED).
9. Injection of hidden fields (Should be DENIED).
10. Unauthenticated create (Should be DENIED).
11. Unauthenticated list (Should be DENIED).
12. Terminal state modification (Once created, reports are effectively immutable).

## Test Runner
The firestore rules will be tested to ensure these invariants hold.
