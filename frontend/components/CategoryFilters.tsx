'use client'
import { Button } from '@/components/ui/button'
import { categoryColors } from '@/lib/utils'
import { categories } from '@/lib/utils'
import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function CategoryFilters() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const { getToken } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const fetchedToken = await getToken()
        setToken(fetchedToken)
        console.log(fetchedToken)
      } catch (err) {
        setError('Failed to retrieve authentication token')
      }
    }

    fetchToken()
  }, [getToken])

  const handleCategoryClick = async (category: string) => {
    let newCategories: string[]
    if (selectedCategories.includes(category)) {
      newCategories = selectedCategories.filter(c => c !== category)
    } else {
      newCategories = [...selectedCategories, category]
    }
    setSelectedCategories(newCategories)

    try {
      const response = await fetch(
        '${process.env.NEXT_PUBLIC_API_URL}/users/interests',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            interests: newCategories
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update interests')
      }
    } catch (error) {
      console.error('Error updating categories:', error)
    }
  }

  return (
    <div className='mb-4 flex flex-wrap gap-2'>
      {categories.map(category => (
        <Button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`${categoryColors[category]} ${
            selectedCategories.includes(category) ? 'ring-2 ring-primary' : ''
          }`}
          variant='ghost'
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Button>
      ))}
    </div>
  )
}
