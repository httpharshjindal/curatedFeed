"use client"
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'

interface UseUserInterestsReturn {
  interests: string[]
  loading: boolean
  error: string | null
  refreshInterests: () => void
}

export function useUserInterests(open: boolean): UseUserInterestsReturn {
    const [interests, setInterests] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { getToken } = useAuth()
  
    const fetchUserInterests = useCallback(async () => {
      console.log('Fetching user interests, open:', open);
      if (!open) return
  
      try {
        setLoading(true)
        const token = await getToken()
        console.log('Token:', token);
  
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/interests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
  
        const data = await response.json()
        console.log('Interests fetch response:', data);
        
        if (data.success) {
          setInterests(data.interests)
          console.log('Interests set:', data.interests);
        } else {
          console.error('Failed to fetch interests');
          setError('Failed to fetch interests')
        }
      } catch (err) {
        console.error('Error fetching interests:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch interests')
      } finally {
        setLoading(false)
        console.log('Loading complete');
      }
    }, [open, getToken])
  
    useEffect(() => {
      fetchUserInterests()
    }, [fetchUserInterests])
  
    return { interests, loading, error, refreshInterests: fetchUserInterests }
  }

  
  