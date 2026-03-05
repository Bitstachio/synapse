/**
 * Auth0 API permissions for the Synapse Framework API.
 * Configure these in Auth0 Dashboard → APIs → [Your API] → Permissions.
 * Assign them to roles (Viewer, Editor, Admin) and assign roles to users.
 */
export const Permissions = {
  READ_FRAMEWORKS: "read:frameworks",
  CREATE_FRAMEWORKS: "create:frameworks",
  UPDATE_FRAMEWORKS: "update:frameworks",
  DELETE_FRAMEWORKS: "delete:frameworks",
  ACTIVATE_FRAMEWORKS: "activate:frameworks",
} as const;
