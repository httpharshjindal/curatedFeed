import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface UseUserInterestsReturn {
  interests: string[];
  loading: boolean;
  error: string | null;
  refreshInterests: () => void;
}

export function useUserInterests(open: boolean,token:string): UseUserInterestsReturn {
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchUserInterests = useCallback(async () => {
    if (!open) return;

    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/interests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setInterests(data.interests);
      } else {
        setError('Failed to fetch interests');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interests');
    } finally {
      setLoading(false);
    }
  }, [open, token]);

  useEffect(() => {
    fetchUserInterests();
  }, [fetchUserInterests]);

  return { interests, loading, error, refreshInterests: fetchUserInterests };
}
