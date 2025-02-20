'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import ArticleCard from './ui/ArticleCard'
import ArticleCardSkeleton from './ui/ArticleCardSkeleton'
import { Article } from '@/lib/utils'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

interface BookmarkResponse {
  articles: Article[]
  pagination: {
    total: number
    page: number
    totalPages: number
    hasMore: boolean
  }
}

export default function BookmarkedArticles() {
  const { getToken } = useAuth()
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [bookmarkLoading, setBookmarkLoading] = useState<number | null>(null)

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true)
        const token = await getToken()
        const response = await fetch(
          `http://localhost:3001/api/bookmarks?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        const data = (await response.json()) as BookmarkResponse
        setBookmarkedArticles(data.articles)
        setTotalPages(Math.ceil(data.pagination.total / 20))
      } catch (error) {
        setError('Failed to fetch bookmarked articles')
      } finally {
        setLoading(false)
      }
    }

    fetchBookmarks()
  }, [currentPage, getToken])
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const handleToggleBookmark = async (articleId: number) => {
    const token = await getToken()
    if (!token) return
    setBookmarkLoading(articleId)
    try {
      await fetch(`http://localhost:3001/api/bookmarks/${articleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // Remove the article from the list
      setBookmarkedArticles(prev =>
        prev.filter(article => article.id !== articleId)
      )
    } catch (error) {
      console.error('Error removing bookmark:', error)
    } finally {
      setBookmarkLoading(null)
    }
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
            {bookmarkedArticles.length > 0 ? (
              bookmarkedArticles.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isBookmarked={true}
                  onToggleBookmark={handleToggleBookmark}
                  loading={bookmarkLoading === article.id}
                />
              ))
            ) : (
              <div>No favourite articles!</div>
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
    </div>
  )
}
