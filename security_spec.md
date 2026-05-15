# Security Specification: Madrocket Neural Audit

## Data Invariants
1. A user profile cannot be created with 'admin' role or premium 'tier' by the client.
2. An audit report must belong to the authenticated user who generated it.
3. Users cannot modify the `role` or `tier` fields in their own profiles.
4. Audit reports are immutable once created (except for admin correction).
5. Public configs (tiers, settings) are read-only for standard users.

## The Dirty Dozen (Threat Payloads)
1. **Self-Promotion**: Create user profile with `role: 'admin'`.
2. **Tier Injection**: Update user profile with `tier: 'specialist'` without payment.
3. **Identity Spoofing**: Create audit report with `userId: 'victim_uid'`.
4. **Data Scraping**: List all audits without being an admin.
5. **PII Leak**: Read another user's profile info.
6. **Config Tampering**: Update a pricing tier price to 'Rs. 1'.
7. **Phantom Audits**: Create audit without a valid session.
8. **Shadow Fields**: Add `isVerified: true` to an audit report.
9. **Deletion Attack**: Delete another user's audit report.
10. **Quota Bypass**: Reset `auditsUsed` via client-side update.
11. **Resource Exhaustion**: Use giant strings for `url` field.
12. **Bypass Lock**: Update an audit's score after it's been finalized.

## Test Runner (Logic Check)
The `firestore.rules` will be verified against these scenarios using standard Boolean logic in the rule definitions. (Detailed tests in `firestore.rules.test.ts`)
