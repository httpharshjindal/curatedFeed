'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { categories, categoryColors } from '@/lib/utils'
import { useAuth } from '@clerk/nextjs'
import { useInterest } from '@/context/InterestContext'
import { toast } from 'sonner'
import { Router } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUserInterests } from '@/hook/useUserInterests'

export function UpdateInterest({
  open,
  setOpen
}: {
  open: boolean
  setOpen: (value: boolean) => void
}) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const { triggerRefresh } = useInterest()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState('')
  // Destructure and alias hook values
  const { getToken, isLoaded } = useAuth()

  useEffect(() => {
    const fetchToken = async () => {
      try {
        if (isLoaded) {
          // Only fetch token if Clerk is loaded
          const fetchedToken = await getToken()
          if (fetchedToken) {
            setToken(fetchedToken)
          }
          console.log(fetchedToken)
        }
      } catch (err) {
        setError('Failed to retrieve authentication token')
      }
    }
    fetchToken()
  }, [getToken, isLoaded])

  const {
    interests,
    loading: hookLoading,
    error: hookError,
    refreshInterests
  } = useUserInterests(open, token)

  useEffect(() => {
    // Update local state based on the hook values
    setLoading(hookLoading)
    if (interests && interests.length == 0) {
      toast.message('Set your interest')
    }
    if (interests) {
      setSelectedCategories(interests)
    }
  }, [hookLoading, hookError, interests])

  const handleCategoryClick = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleUpdate = async () => {
    try {
      setLoading(true)
      setError(null)
      if (selectedCategories.length < 3) {
        setError('Please select at least Three interest')
        toast.error('Please select at least Three interest')
        return
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/interests`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            interests: selectedCategories
          })
        }
      )

      console.log(response)
      if (!response.ok) {
        throw new Error('Failed to update interests')
        return
      }
      setOpen(false)
      triggerRefresh()
      router.replace('/')
      toast.success('Interests updated successfully')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update interests'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='w-4/5 sm:max-w-[425px]'>
        {loading && (
          <div className='absolute inset-0 flex items-center justify-center bg-background/80'>
            <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>Update Your Interests</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          {error && <p className='text-sm text-red-500'>{error}</p>}
          <div className='flex w-full flex-wrap gap-2'>
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`text-xs sm:text-sm ${categoryColors[category]} ${
                  selectedCategories.includes(category)
                    ? 'ring-2 ring-primary'
                    : ''
                }`}
                variant='ghost'
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpdate} disabled={loading}>
            Update Interests
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
