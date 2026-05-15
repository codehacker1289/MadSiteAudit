# Security Specification - MadSiteAudit

## 1. Data Invariants
- **Audits**: Every audit report must have a `userId` that matches the `request.auth.uid` of the creator.
- **Audit Immutability**: Once an audit is created, it cannot be modified or deleted by a non-admin.
- **User Integrity**: Users can only read and write their own profile records.
- **Role Isolation**: Only designated admins can change a user's `role` or `isBanned` status.
- **Administrative Override**: Admins have full read/write access to all collections for maintenance.

## 2. The "Dirty Dozen" Payloads (Deny Cases)

1. **Identity Spoofing**: Attempt to create an audit with a `userId` that is not the current user's UID.
2. **Resource Poisoning**: Attempt to create an audit with a URL longer than 2000 characters.
3. **Privilege Escalation**: A standard user attempting to update their `role` to 'admin'.
4. **State Shortcutting**: A user attempting to decrement their `auditsUsed` count.
5. **Orphaned Write**: Attempt to create an audit without a `timestamp`.
6. **Shadow Update**: Attempt to add a hidden `isVerifiedAdmin: true` field to a user profile.
7. **Cross-User Leak**: Non-admin user attempting to list all audits without a `userId` filter.
8. **Impersonation**: User attempting to read another user's profile metadata.
9. **Bypass Ban**: A banned user attempting to perform a new audit.
10. **Quota Manipulation**: Standard user attempting to set `auditQuota` to -1 (unlimited).
11. **Timestamp Spoofing**: User providing a `timestamp` in the future (though we use strings, we should validate format).
12. **Recursive Leak**: Attempting to trigger infinite loops in permission checks (recursion).

## 3. Test Runner Design
The tests will verify that:
- `friendswatchgotforfree@gmail.com` is automatically recognized as an admin.
- Users can only query their own audits.
- Creation of audits requires all mandatory fields.
- User profiles can only be updated by the owner or admin, with restricted fields for owners.
