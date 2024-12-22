import { secureStorage } from "@/lib/secureStorage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  role: string | null;
  error: string | null;
  login: (token: string, user: string, role: string) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      error: null,
      role: null,
      login: (token: string, user: string, role: string) => {
        try {
          if (!token || !user) {
            throw new Error("Invalid login credentials");
          }
          set({
            token,
            user,
            isAuthenticated: true,
            isAdmin: role == "admin",
            error: null,
            role,
          });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Login failed" });
        }
      },
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          error: null,
          role: null,
        }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
