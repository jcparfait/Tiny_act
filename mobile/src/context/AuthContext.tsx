import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  exchangeOauthCode,
  loadCurrentUser,
  loginMobile,
  logoutMobile,
  registerMobile,
  requestPasswordReset as requestReset,
  resetMobilePassword,
  updateMobileProfile,
} from "../services/authApi";

import {
  deleteAuthToken,
  getAuthToken,
  setAuthToken,
} from "../services/authStorage";

import { updateMobileInterests } from "../services/interestsApi";
import { AuthUser } from "../types/tinyAct";

type RegistrationValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<void>;

  signUp: (
    values: RegistrationValues
  ) => Promise<void>;

  completeSocialSignIn: (
    code: string
  ) => Promise<void>;

  requestPasswordReset: (
    email: string
  ) => Promise<string>;

  resetPassword: (
    token: string,
    password: string,
    confirmation: string
  ) => Promise<void>;

  updateProfile: (values: {
    first_name: string;
    last_name: string;
    avatar?: string;
  }) => Promise<void>;

  updateInterests: (
    interestIds: number[]
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

        if (!token) return;

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

  async function storeLoginResponse(response: {
    token: string;
    user: AuthUser;
  }) {
    await setAuthToken(response.token);
    setUser(response.user);
  }

  async function signIn(
    email: string,
    password: string
  ) {
    await storeLoginResponse(
      await loginMobile(email.trim(), password)
    );
  }

  async function signUp(
    values: RegistrationValues
  ) {
    await storeLoginResponse(
      await registerMobile(values)
    );
  }

  async function completeSocialSignIn(
    code: string
  ) {
    await storeLoginResponse(
      await exchangeOauthCode(code)
    );
  }

  async function requestPasswordReset(
    email: string
  ) {
    const response = await requestReset(email.trim());

    return response.message;
  }

  async function resetPassword(
    token: string,
    password: string,
    confirmation: string
  ) {
    await storeLoginResponse(
      await resetMobilePassword({
        reset_password_token: token,
        password,
        password_confirmation: confirmation,
      })
    );
  }

  async function updateProfile(values: {
    first_name: string;
    last_name: string;
    avatar?: string;
  }) {
    const response =
      await updateMobileProfile(values);

    setUser(response.user);
  }

  async function updateInterests(
    interestIds: number[]
  ) {
    const response =
      await updateMobileInterests(interestIds);

    setUser(response.user);
  }

  async function signOut() {
    try {
      await logoutMobile();
    } catch {
      // La déconnexion locale reste prioritaire.
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
        signUp,
        completeSocialSignIn,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        updateInterests,
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
