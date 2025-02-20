import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Inter, Playfair_Display } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

import Providers from '@/components/providers'
import Header from '@/components/header'
import Footer from '@/components/footer'

import './globals.css'
// import UserSync from '@/components/UserSync'
import { InterestProvider } from '@/context/InterestContext'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif'
})

export const metadata: Metadata = {
  title: 'Curated Feed',
  description: 'Curated Feed is a platform that curates the best articles from around the web.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],  
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang='en' className='scroll-smooth' suppressHydrationWarning>
        <body
          className={cn(
            'flex min-h-screen flex-col',
            geistSans.variable,
            geistMono.variable,
            inter.variable,
            playfair.variable
          )}
        >
          <InterestProvider>
            <Providers>
              <Header />
              <main className='grow'>{children}</main>
              <Footer />
            </Providers>
          </InterestProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
