import { createAuthClient } from "better-auth/react";

import {
  twoFactorClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { auth } from "./auth";
export const {
  signIn,
  signUp,
  signOut,
  changePassword,
  useSession,
  requestPasswordReset,
  resetPassword,
  twoFactor,
} = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL || "",
  plugins: [twoFactorClient(), inferAdditionalFields<typeof auth>()],
});
