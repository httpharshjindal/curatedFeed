'use client'

import { useEffect, useState, useRef } from 'react'
import ArticleCard from './ui/ArticleCard'
import ArticleCardSkeleton from './ui/ArticleCardSkeleton'
import { SignedOut, SignInButton, useAuth } from '@clerk/nextjs'
import { Article } from '@/lib/utils'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

export default function Discover() {
  const { getToken, isLoaded } = useAuth()
  const [DiscoverArticles, setDiscoverArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showSignInDialog, setShowSignInDialog] = useState(false)
  const [hasShownDialog, setHasShownDialog] = useState(false)
  const signInButtonRef = useRef<HTMLButtonElement>(null)
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<number>>(new Set())
  const [bookmarkLoading, setBookmarkLoading] = useState<number | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      try {
        if (isLoaded) {  // Only fetch token if Clerk is loaded
          const fetchedToken = await getToken()
          setToken(fetchedToken)
        }
      } catch (err) {
        setError('Failed to retrieve authentication token')
      }
    }

    fetchToken()
  }, [getToken, isLoaded])  // Add isLoaded to dependencies

  useEffect(() => {
    const fetchArticles = async (url: string) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch articles')
        }

        const data = await response.json()
        setDiscoverArticles(data.articles)
        setTotalPages(Math.ceil(data.total / 20)) // Assuming 20 articles per page
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchArticles(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/discover?page=${currentPage}`
      )
    } else {
      fetchArticles(`${process.env.NEXT_PUBLIC_API_URL}/articles`)
    }
  }, [token, currentPage])

  useEffect(() => {
    const handleScroll = () => {
      if (!token && !hasShownDialog) {
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const isAtBottom = scrollPosition >= documentHeight - 100;
        
        if (isAtBottom) {
          setShowSignInDialog(true)
          setHasShownDialog(true)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [token, hasShownDialog])

  useEffect(() => {
    if (showSignInDialog) {
      signInButtonRef.current?.click()
      setShowSignInDialog(false)
    }
  }, [showSignInDialog])

  // Fetch bookmark status for all articles
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (!token) return
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookmarks`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()
        setBookmarkedArticles(new Set(data.articles.map((a: Article) => a.id)))
      } catch (error) {
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
        : '${process.env.NEXT_PUBLIC_API_URL}/bookmarks'

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
        if (isBookmarked) {
          next.delete(articleId)
        } else {
          next.add(articleId)
        }
        return next
      })
    } catch (error) {
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
            {DiscoverArticles.length > 0 ? (
              DiscoverArticles.map(article => (
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

          {totalPages > 1 && (
            <Pagination className='py-4'>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index + 1}>
                    <PaginationLink
                      onClick={() => handlePageChange(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <SignedOut>
        <SignInButton mode='modal'>
          <button ref={signInButtonRef} className="hidden">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  )
}
