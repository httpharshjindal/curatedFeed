import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Article {
  id: number
  title: string
  snippet: string
  link: string
  category: string
  date: string
  position: number
  createdAt: Date
  updatedAt: Date
  content: string
}

export interface ProcessedArticle {
  id?: number;
  articleId?: number;
  refinedTitle: string;
  refinedArticle: string;
  summary: string;
  keyTakeaways: string[];
  originalContent?: {
    title: string;
    content: string;
  };
  processedAt?: string;
}

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

export const categories = [
  'technology',
  'ai',
  'business',
  'science',
  'health',
  'politics',
  'entertainment'
] as const
