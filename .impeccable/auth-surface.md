# Account access
Mode: Operate. Build path: code-first, scoped feature extension within Campus Atelier.
User requested registration and sign-in after the Tiffany redesign. Preserve the selected visual world and every existing school workflow.
THESIS: A clear account boundary before entering a school workspace.
OWN-WORLD: inherit Tiffany #81d8d0, carbon #20211f, warm paper #f4f2ed, Archivo and IBM Plex Sans from DESIGN.md.
STORY: sign in or create an account, optionally include fictional records, enter only that account's workspace, sign out from the sidebar.
FIRST VIEWPORT: Tiffany identity field on desktop; warm-paper sign-in form with email/password, native inputs, password visibility and sign-in/register switch. On mobile retain a Tiffany brand strip and a single-column form.
FORM: scoped extension of Campus Atelier seed:e0292d7dcc5f9a97; no new visual-direction round or image comp.
States: checking session, empty input, busy submission, password mismatch, invalid credentials, expired session, account-created workspace and signed-out state. Do not imply email verification or password recovery; these are not implemented.
Existing App and RecordForm use the same cookie/CSRF-aware request helper. Every new public account receives its own SQLite workspace. Access to an existing MySQL schema is operator-provisioned only. No schema or account is claimed automatically by public signup.
