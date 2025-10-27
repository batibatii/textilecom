"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth, FirebaseError, createUser, getUserData } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
} from "firebase/auth";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
interface BaseUser extends FirebaseUser {
  id: string;
  role: "admin" | "customer" | "superAdmin";
  email: string;
  theme?: string;
  createdAt: Date;
}
export interface CustomerUser extends BaseUser {
  role: "customer";
  address: {
    line1: string;
    line2: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    line1: string;
    line2: string;
    city: string;
    postalCode: string;
    country: string;
  };
  discounts: Array<{
    code: string;
    validUntil: Date;
  }>;
}
export interface AdminUser extends BaseUser {
  role: "admin" | "superAdmin";
}
export type User = CustomerUser | AdminUser;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: FirebaseError | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [error, setError] = useState<FirebaseError | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser.uid);
        if (userData) {
          setUser({ ...firebaseUser, ...userData } as User);
        } else {
          setUser(firebaseUser as User);
        }
      } else {
        setUser(null);
      }
      setInitializing(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await createUser(email, userCredential.user.uid);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = await getUserData(user.uid);
      if (!userData) {
        await createUser(user.email || "", user.uid);
      }

      setError(null);
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setError({ code: errorCode, message: errorMessage });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      setError(null);
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      setError(null);
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setUser(auth.currentUser as User);
      }
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <TailChase size="40" speed="1.75" color="black" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        loginWithGoogle,
        logout,
        deleteAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
