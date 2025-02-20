'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth
} from '@clerk/nextjs'
import Discover from '../components/Discover'
import Interest from '../components/Intrest'


export default function GetArticles() {
  const [tab, setTab] = useState('discover')
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [token, setToken] = useState<string | null>(null)
console.log(process.env.NEXT_PUBLIC_API_URL)
  // Set tab to discover when user signs in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setTab('discover')
    }
  }, [isLoaded, isSignedIn])

  return (
    <section>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className='w-full justify-around'>
          <TabsTrigger value='discover' className='w-full'>
            Discover
          </TabsTrigger>
          <SignedIn>
            <TabsTrigger value='intrest' className='w-full'>
              Interest
            </TabsTrigger>
          </SignedIn>
          <SignedOut>
            <SignInButton mode='modal'>
              <TabsTrigger value='intrest' className='w-full'>
                Interest
              </TabsTrigger>
            </SignInButton>
          </SignedOut>
        </TabsList>

        <div>
          <TabsContent value='discover'>
            <Discover />
          </TabsContent>
          <TabsContent value='intrest'>
            <Interest />
          </TabsContent>
        </div>
      </Tabs>
    </section>
  )
}
