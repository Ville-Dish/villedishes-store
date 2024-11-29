import { create } from "zustand";
import { auth } from "@/config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

interface AuthState {
  user: unknown;
  setUser: (user: unknown) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },
}));

// Initialize listener
onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user);
});
