'use client'

import BookmarkedArticles from '@/components/BookmarkedArticles'

export default function Bookmarks() {
  return (
    <div>
      <h1 className='text-sm md:text-2xl font-bold text-center absolute top-30 sm:top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 '>Favorite Articles</h1>
      <BookmarkedArticles />
    </div>
  )
}
