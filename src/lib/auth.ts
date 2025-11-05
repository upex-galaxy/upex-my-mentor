"use client";

import { User, LoginCredentials, SignupData } from "@/types";

const AUTH_STORAGE_KEY = "upex_my_mentor_auth";
const USERS_STORAGE_KEY = "upex_my_mentor_users";

// Mock storage helpers
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  if (typeof window === "undefined") return;

  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function getStoredUsers(): User[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function setStoredUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Mock auth functions
export async function mockLogin(credentials: LoginCredentials): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getStoredUsers();
  const user = users.find((u) => u.email === credentials.email);

  if (!user) {
    throw new Error("Usuario no encontrado. Por favor regístrate primero.");
  }

  // In a real app, we'd verify the password hash
  // For mock purposes, we just return the user
  setStoredUser(user);
  return user;
}

export async function mockSignup(data: SignupData): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getStoredUsers();

  // Check if user already exists
  const existingUser = users.find((u) => u.email === data.email);
  if (existingUser) {
    throw new Error("Este email ya está registrado.");
  }

  // Create new user
  const newUser: User = {
    id: Math.random().toString(36).substring(7),
    email: data.email,
    name: data.name,
    role: data.role,
    photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
    createdAt: new Date(),
  };

  // Save to "database"
  users.push(newUser);
  setStoredUsers(users);
  setStoredUser(newUser);

  return newUser;
}

export function mockLogout(): void {
  setStoredUser(null);
}

export function isAuthenticated(): boolean {
  return getStoredUser() !== null;
}
