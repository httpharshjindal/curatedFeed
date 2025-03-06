import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Article, ProcessedArticle } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import { SliderContent } from './SliderContent'

interface ArticleCardProps {
  article: Article
  isBookmarked: boolean
  onToggleBookmark: (articleId: number) => Promise<void>
  loading?: boolean
  token?: string
}

// Match the schema enum categories
export const categoryColors: { [key: string]: string } = {
  technology:
    'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100',
  ai: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
  business: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
  science:
    'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
  health: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100',
  politics: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
  entertainment:
    'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100'
}

const ArticleCard = ({
  article,
  isBookmarked,
  onToggleBookmark,
  loading = false,
  token
}: ArticleCardProps) => {
  const [processedArticle, setProcessedArticle] = useState<ProcessedArticle>({
    refinedTitle: '',
    refinedArticle: '',
    summary: '',
    keyTakeaways: [] // Initialize with an empty array
  })

  const [error, setError] = useState<string | null>(null)
  const [sliderLoading, setSliderLoading] = useState(false)
  const [newArticles, setNewArticles] = useState<Article[]>([])
  
  const handleClick = () => {
    // Only fetch if we don't already have data
    if (!processedArticle.keyTakeaways?.length) {
      setSliderLoading(true)
      fetchArticleData()
    }
  }
  
  const fetchArticleData = async () => {
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${article.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch article data')
      }

      const data = await response.json()
            
      setProcessedArticle(data.article.processedData)
      setNewArticles(data.article.article)
    } catch (err) {
      toast.error('Failed to fetch article data')
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSliderLoading(false)
    }
  }
  
  const categoryColorClasses =
    categoryColors[article.category.toLowerCase()] ||
    'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'

  return (
    <div className='flex items-center justify-center'>
      <Sheet>
        <SheetTrigger asChild>
          <div onClick={handleClick}>
            <div className='relative my-auto flex items-center justify-center rounded-lg'>
              <div className='absolute right-1 top-1 z-10 flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={e => {
                    e.stopPropagation()
                    onToggleBookmark(article.id)
                  }}
                  disabled={loading}
                  className='h-8 w-8 p-0'
                >
                  <Heart
                    className={`h-5 w-5 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                  />
                </Button>
              </div>
              <Card
                className='mb-4 w-[90vw] cursor-pointer bg-card text-card-foreground transition-shadow hover:shadow-lg'
              >
                <CardHeader className='space-y-2'>
                  <div className='flex items-start justify-between gap-4'>
                    <CardTitle className='flex items-center gap-2 text-sm font-bold text-foreground sm:text-2xl'>
                      {article.title}
                      <ExternalLink className='h-4 w-4 text-muted-foreground' />
                    </CardTitle>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`whitespace-nowrap rounded-full px-2 py-1 text-[8px] sm:text-sm ${categoryColorClasses}`}
                    >
                      {article.category}
                    </span>
                    <p className='text-sm text-muted-foreground'>
                      {new Date(article.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-xs text-muted-foreground sm:text-sm'>
                    {article.snippet}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </SheetTrigger>

        <SheetContent side={'bottom'} className='h-full overflow-y-scroll'>
          <div>
            <SheetHeader>
              <SheetTitle>{article.title}</SheetTitle>

              <SheetDescription>
                <div>
                  <div>
                    <h3>{article.content}</h3>
                  </div>
                  {sliderLoading ? (
                    <p>Loading article data...</p>
                  ) : error ? (
                    <p className="text-red-500">Error: {error}</p>
                  ) : (
                    <SliderContent processedArticle={processedArticle} />
                  )}
                </div>
              </SheetDescription>
            </SheetHeader>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default ArticleCard