import { auth } from "@/config/firebase";

export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (user) {
      // Force refresh the token
      const newToken = await user.getIdToken(true);

      // Update the cookie
      await fetch("/api/set-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: newToken }),
      });

      return newToken;
    }
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};

// Auto-refresh tokens before they expire
export const setupTokenRefresh = () => {
  const user = auth.currentUser;
  if (user) {
    // Refresh token every 50 minutes (Firebase tokens expire after 1 hour)
    setInterval(
      async () => {
        await refreshAuthToken();
      },
      50 * 60 * 1000
    );
  }
};
