'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { UpdateInterest } from './UpdateInterest'
import { Heart, Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className='relative py-4'>
      <nav className='container flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Link href='/' className='flex items-center gap-2'>
            <Image
              src='/curatedFeedLogo.png'
              alt='CuratedFeed'
              width={32}
              height={32}
              priority
            />
            <span className='text-lg font-semibold'>CuratedFeed</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className='hidden items-center justify-between gap-6 md:flex'>
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode='modal'>
              <Button size='sm'>Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href='/bookmark'>
              <Heart className='h-5 w-5 fill-red-500 text-red-500 hover:fill-red-600 hover:text-red-600' />
            </Link>
            <UpdateInterest />
            <UserButton />
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <div className='flex items-center gap-4 md:hidden'>
          <ThemeToggle />
          <Link href='/bookmark'>
            <Heart className='h-5 w-5 fill-red-500 text-red-500 hover:fill-red-600 hover:text-red-600' />
          </Link>
          <button
            onClick={toggleMenu}
            className='rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            {isMenuOpen ? (
              <X className='h-6 w-6' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='absolute right-0 top-full z-50 w-3/5 border-b bg-background md:hidden'>
            <div className='container flex flex-col gap-4 py-4'>
              <SignedOut>
                <SignInButton mode='modal'>
                  <Button size='sm' className='w-full'>
                    Sign in
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className='flex flex-col gap-4 items-end'>
                  <div className='px-4 py-2'>
                    <UserButton />
                  </div>
                  <div className='px-4 py-2'>
                    <UpdateInterest />
                  </div>
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
