// Shared session-cookie name. Kept dependency-free (no firebase-admin, no
// Node-only APIs) so it can be safely imported from Edge middleware as well
// as Node server routes/actions.
export const SESSION_COOKIE_NAME = "__session";
