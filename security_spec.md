# Security Specification & Threat Model for ActionScribe Firestore

## 1. Core Data Invariants
- **User Profiles (`/users/{userId}`)**: A user document can only be read and written by the authenticated owner (`request.auth.uid == userId`) or admin.
- **Meeting Records (`/meetings/{meetingId}`)**: A meeting must have an owner (`userId`). Only the creator/owner can read, update, or delete their meeting record.
- **Invoices (`/invoices/{invoiceId}`)**: An invoice document belongs to a specific user (`userId`). Only the owner or an admin can access or generate their invoices.
- **Custom Templates (`/templates/{templateId}`)**: Custom templates belong to the user (`userId`). Only the creator can modify or delete their templates.

## 2. The "Dirty Dozen" Attack Vectors & Payloads
1. **Unauthenticated Read on User Profiles**: An unauthenticated client attempts to query or fetch `/users/client_1`. (Must return `PERMISSION_DENIED`).
2. **Cross-Tenant Meeting Snoop**: User B (`uid_bob`) attempts to fetch or list meeting documents belonging to User A (`uid_alice`). (Must return `PERMISSION_DENIED`).
3. **Identity Spoofing on Create**: An authenticated user with `uid_bob` attempts to create a meeting with `userId: "uid_alice"`. (Must return `PERMISSION_DENIED`).
4. **Denial-of-Wallet Payload Overflow**: Attacker attempts to store a 2MB string in `summary` or inject an excessively long ID. (Must return `PERMISSION_DENIED`).
5. **Ghost Field Poisoning**: Client attempts an update on a meeting containing unauthorized system or privilege escalation fields (e.g., `isAdmin: true`). (Must return `PERMISSION_DENIED`).
6. **Cross-User Invoice Tampering**: User B attempts to delete or alter invoice numbers or amounts belonging to User A. (Must return `PERMISSION_DENIED`).
7. **Malicious Path Traversal**: Attacker sends special path characters or non-alphanumeric symbols in document IDs. (Must return `PERMISSION_DENIED` via `isValidId()`).
8. **Unbounded Array Injection**: Attacker injects a list with 10,000 array elements into `participants` or `keyPoints`. (Must return `PERMISSION_DENIED` via `.size() <= 50`).
9. **Role Modification by Self**: User attempts to assign themselves an administrative role or elevated access rights without verification. (Must return `PERMISSION_DENIED`).
10. **Query Scraping Without Owner Filter**: Client attempts an `allow list` query across `/meetings` without specifying `where("userId", "==", request.auth.uid)`. (Must return `PERMISSION_DENIED`).
11. **Immutable Creation Timestamp Mutation**: Client attempts to overwrite `createdAt` with a backdated timestamp. (Must return `PERMISSION_DENIED`).
12. **Orphaned Writes**: Client attempts to create an invoice for a non-existent or unowned meeting record. (Must return `PERMISSION_DENIED`).
