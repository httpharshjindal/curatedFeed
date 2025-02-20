"use client"
import { createContext, useContext, useState } from 'react'

type InterestContextType = {
  refreshTrigger: number
  triggerRefresh: () => void
}

const InterestContext = createContext<InterestContextType>({
  refreshTrigger: 0,
  triggerRefresh: () => {}
})

export function InterestProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <InterestContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </InterestContext.Provider>
  )
}

export const useInterest = () => useContext(InterestContext) 