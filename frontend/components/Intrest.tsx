'use client'
import { useEffect, useState } from 'react'
import ArticleCard from './ArticleCard'
import ArticleCardSkeleton from './ArticleCardSkeleton'
import { useAuth } from '@clerk/nextjs'
import { Article } from '@/lib/utils'
import { useInterest } from '@/context/InterestContext'
import { toast } from 'sonner'
import SlidingPagination from './SlidingPagination'
import { useUserInterests } from '@/hook/useUserInterests'
import { useRouter } from 'next/navigation'

export default function Interest() {
  const { getToken } = useAuth()
  const { refreshTrigger } = useInterest()
  const [tab, setTab] = useState('discover')
  const [InterestArticles, setInterestArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<number>>(
    new Set()
  )
  const router = useRouter()
  const [bookmarkLoading, setBookmarkLoading] = useState<number | null>(null)
  const {
    interests,
    loading: hookLoading,
    error: hookError,
    refreshInterests
  } = useUserInterests(true)

  // Separate effect for redirection
  useEffect(() => {
    // Delay the check slightly to ensure all loading is complete
    const timer = setTimeout(() => {
      if (!hookLoading && (!interests || interests.length === 0)) {
        console.log('Redirecting due to no interests')
        router.push('/updateIntrest')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [hookLoading, interests, router])

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const fetchedToken = await getToken()
        setToken(fetchedToken)
      } catch (err) {
        setError('Failed to retrieve authentication token')
      }
    }
    fetchToken()
  }, [getToken])

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/articles/intrest?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        if (!response.ok) {
          throw new Error('Failed to fetch articles')
        }
        const data = await response.json()
        setInterestArticles(data.articles)
        setTotalPages(Math.ceil(data.total / 20))
      } catch (err) {
        toast.error('Failed to fetch articles')
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    if (token) {
      fetchArticles()
    }
  }, [tab, token, refreshTrigger, currentPage, interests])

  // Fetch bookmark status for all articles
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (!token) return
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/bookmarks`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        const data = await response.json()
        setBookmarkedArticles(new Set(data.articles.map((a: Article) => a.id)))
      } catch (error) {
        toast.error('Failed to fetch bookmark status')
        console.error('Error fetching bookmark status:', error)
      }
    }
    fetchBookmarkStatus()
  }, [token])

  const handleToggleBookmark = async (articleId: number) => {
    if (!token) return
    setBookmarkLoading(articleId)
    try {
      const isBookmarked = bookmarkedArticles.has(articleId)
      const method = isBookmarked ? 'DELETE' : 'POST'
      const url = isBookmarked
        ? `${process.env.NEXT_PUBLIC_API_URL}/bookmarks/${articleId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/bookmarks`
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        ...(method === 'POST' && { body: JSON.stringify({ articleId }) })
      })
      setBookmarkedArticles(prev => {
        const next = new Set(prev)
        isBookmarked ? next.delete(articleId) : next.add(articleId)
        return next
      })
    } catch (error) {
      toast.error('Failed to toggle bookmark')
      console.error('Error toggling bookmark:', error)
    } finally {
      setBookmarkLoading(null)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <div>
      {loading ? (
        <div className='space-y-4 py-4'>
          {[1, 2, 3].map(i => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className='w-full space-y-4 py-4'>
            {InterestArticles && InterestArticles.length > 0 ? (
              InterestArticles.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isBookmarked={bookmarkedArticles.has(article.id)}
                  onToggleBookmark={handleToggleBookmark}
                  loading={bookmarkLoading === article.id}
                />
              ))
            ) : (
              <div className='text-center text-2xl font-bold'>
                No articles found
              </div>
            )}
          </div>
          <div>
            <SlidingPagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  )
}
