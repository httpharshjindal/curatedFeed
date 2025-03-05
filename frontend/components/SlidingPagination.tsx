'use client'
import React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

interface SlidingPaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  pagesPerWindow?: number
}

const SlidingPagination: React.FC<SlidingPaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  pagesPerWindow = 5
}) => {
  if (totalPages <= 1) return null

  // Determine the start and end page for the current window
  const startPage = Math.floor((currentPage - 1) / pagesPerWindow) * pagesPerWindow + 1
  const endPage = Math.min(startPage + pagesPerWindow - 1, totalPages)

  return (
    <Pagination className='py-4'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
        </PaginationItem>

        {/* Show first page and ellipsis if needed */}
        {startPage > 1 && (
          <>
            <PaginationItem>
              <PaginationLink onClick={() => onPageChange(1)} isActive={currentPage === 1}>
                1
              </PaginationLink>
            </PaginationItem>
            {startPage > 2 && (
              <PaginationItem>
                <span className='px-2'>...</span>
              </PaginationItem>
            )}
          </>
        )}

        {/* Render the current window of page numbers */}
        {Array.from({ length: endPage - startPage + 1 }, (_, index) => {
          const page = startPage + index
          return (
            <PaginationItem key={page}>
              <PaginationLink onClick={() => onPageChange(page)} isActive={currentPage === page}>
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        {/* Show ellipsis and last page if needed */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <PaginationItem>
                <span className='px-2'>...</span>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(totalPages)}
                isActive={currentPage === totalPages}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default SlidingPagination
