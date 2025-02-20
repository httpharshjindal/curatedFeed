import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Heart } from 'lucide-react'
import { Button } from './button'

interface Article {
  id: number
  title: string
  snippet: string
  link: string
  category: string
  date: string
  position: number
  createdAt: Date
  updatedAt: Date
}

interface ArticleCardProps {
  article: Article
  isBookmarked: boolean
  onToggleBookmark: (articleId: number) => Promise<void>
  loading?: boolean
}

// Match the schema enum categories
const categoryColors: { [key: string]: string } = {
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
  loading = false
}: ArticleCardProps) => {
  const handleClick = () => {
    window.open(article.link, '_blank', 'noopener noreferrer')
  }

  const categoryColorClasses =
    categoryColors[article.category.toLowerCase()] ||
    'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'

  return (
    <div className='relative mx-6 my-auto rounded-lg'>
      <div className='z-50 flex absolute items-center gap-2 top-1 right-1'>
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
        className='mb-4 cursor-pointer bg-card text-card-foreground transition-shadow hover:shadow-lg'
        onClick={handleClick}
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
          <p className='text-muted-foreground text-xs sm:text-sm'>{article.snippet}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ArticleCard
