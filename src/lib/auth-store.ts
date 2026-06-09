import { useEffect, useState } from "react";
import { USERS, type User, type UserRole } from "./mock-data";

const STORAGE_KEY = "pms.session";

// Mutable runtime store of user-updated mock data (payments, maintenance)
type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function emit() {
  listeners.forEach((l) => l());
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const id = JSON.parse(raw) as string;
    return USERS.find((u) => u.id === id) ?? null;
  } catch {
    return null;
  }
}

export function login(email: string, password: string): User | null {
  const user = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (!user) return null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user.id));
  emit();
  return user;
}

export function register(input: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}): { user: User | null; error?: string } {
  const email = input.email.trim().toLowerCase();
  if (USERS.some((u) => u.email.toLowerCase() === email)) {
    return { user: null, error: "An account with this email already exists." };
  }
  const newUser: User = {
    id: "u_" + Date.now().toString(36),
    name: input.name.trim(),
    email,
    password: input.password,
    role: input.role ?? "landlord",
    phone: input.phone,
    subscription: "Basic",
  };
  USERS.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser.id));
  emit();
  return { user: newUser };
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
  emit();
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  useEffect(() => {
    const unsub = subscribe(() => setUser(getCurrentUser()));
    return () => {
      unsub();
    };
  }, []);
  return user;
}
