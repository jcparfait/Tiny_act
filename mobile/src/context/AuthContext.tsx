import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loadCurrentUser,
  loginMobile,
  logoutMobile,
} from "../services/api";

import {
  deleteAuthToken,
  getAuthToken,
  setAuthToken,
} from "../services/authStorage";

import { AuthUser } from "../types/tinyAct";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const token = await getAuthToken();

        if (!token) {
          return;
        }

        const response = await loadCurrentUser();

        if (!cancelled) {
          setUser(response.user);
        }
      } catch {
        await deleteAuthToken();

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn(
    email: string,
    password: string
  ) {
    const response = await loginMobile(
      email.trim(),
      password
    );

    await setAuthToken(response.token);
    setUser(response.user);
  }

  async function signOut() {
    try {
      await logoutMobile();
    } catch {
      // La déconnexion locale doit fonctionner
      // même si Rails n'est pas accessible.
    } finally {
      await deleteAuthToken();
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider."
    );
  }

  return context;
}
