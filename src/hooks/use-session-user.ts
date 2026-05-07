import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import { User, getCurrentUser } from '../api/user';

const STORAGE_KEY = 'session_user';

/**
 * Hook to manage ephemeral global user state
 * Synchronizes across browser tabs using localStorage events
 */
export const useSessionUser = () => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback(async (newUser: User) => {
    setUserState(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  }, []);

  const clearUser = useCallback(async () => {
    setUserState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const syncUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      if (response.success && response.data) {
        await setUser(response.data);
        setLoading(false);
        return response.data;
      } else {
        await clearUser();
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
    return null;
  }, [setUser, clearUser]);

  // Initial load
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
        setLoading(false);
      } catch (e) {
        setLoading(true);
      }
    } else {
      setLoading(true);
    }
    // Always sync on mount to verify session
    syncUser();
  }, [syncUser]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : null;
          setUserState(newValue);
        } catch (e) {
          setUserState(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { user, setUser, syncUser, clearUser, loading };
};
