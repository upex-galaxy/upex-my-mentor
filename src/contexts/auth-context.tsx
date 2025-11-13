"use client";

import { LoginCredentials, SignupData, User } from "@/types";
import { Database } from "@/types/supabase";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single<Database["public"]["Tables"]["profiles"]["Row"]>();

          if (profile) {
            // This is a simplified mapping. You might need a more robust one.
            const userProfile: User = {
              id: profile.id,
              email: profile.email!,
              name: profile.name!,
              role: profile.role as User["role"],
              photoUrl: profile.photo_url || undefined,
              description: profile.description || undefined,
              createdAt: new Date(profile.created_at!),
            };
            setUser(userProfile);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, router]);

  const login = async (credentials: LoginCredentials) => {
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
      console.error("Login failed:", error.message);
      throw error;
    }
    router.refresh();
  };

  const signup = async (data: SignupData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role,
        },
      },
    });
    if (error) {
      console.error("Signup failed:", error.message);
      throw error;
    }
    router.refresh();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
