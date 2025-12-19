"use client";

import { LoginCredentials, SignupData, User } from "@/types";
import { Database } from "@/types/supabase";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Create Supabase client once using useMemo to prevent recreation on each render
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to fetch profile and set user state
  const fetchProfileAndSetUser = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single<Database["public"]["Tables"]["profiles"]["Row"]>();

      if (error) {
        console.error("Error fetching profile:", error.message);
        setUser(null);
        return;
      }

      if (profile) {
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
    } catch (err) {
      console.error("Error in fetchProfileAndSetUser:", err);
      setUser(null);
    }
  }, [supabase]);

  useEffect(() => {
    // Subscribe to auth state changes
    // IMPORTANT: Do NOT use async callbacks directly in onAuthStateChange to avoid deadlocks
    // Defer Supabase calls using setTimeout as per official documentation
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Use setTimeout to defer async operations and avoid deadlocks
        // This is the recommended pattern from Supabase documentation
        setTimeout(async () => {
          if (session?.user) {
            await fetchProfileAndSetUser(session.user.id);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }, 0);
      }
    );

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, fetchProfileAndSetUser]);

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
    // Sign out from Supabase with global scope to sign out from all tabs/windows
    await supabase.auth.signOut({ scope: 'global' });
    setUser(null);
    // Refresh the router to invalidate server-side cached session
    router.refresh();
    // Then navigate to home page
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
