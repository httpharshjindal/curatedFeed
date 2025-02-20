'use client'
import Link from 'next/link'
import Image from 'next/image'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { UpdateInterest } from './ui/UpdateInterest'
import { Heart } from 'lucide-react'

export default function Header() {
  return (
    <header className='py-4'>
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

        <div className='flex items-center justify-between gap-6'>
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
      </nav>
    </header>
  )
}
