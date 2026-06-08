import { useEffect, useState } from "react";
import { USERS, type User } from "./mock-data";

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
