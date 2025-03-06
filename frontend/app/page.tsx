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
  
  // This effect will run when authentication state changes
  useEffect(() => {
    if (isLoaded) {
      // If signed in, keep tab as is. If signed out, set to discover
      if (!isSignedIn) {
        setTab('discover')
      }
    }
  }, [isLoaded, isSignedIn])
  
  return (
    <section>
      <Tabs value={tab} defaultValue="discover">
        <TabsList className='w-full justify-around'>
          <TabsTrigger 
            value='discover' 
            className='w-full'
            onClick={() => setTab('discover')}
          >
            Discover
          </TabsTrigger>
          <SignedIn>
            <TabsTrigger 
              value='intrest' 
              className='w-full'
              onClick={() => setTab('intrest')}
            >
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