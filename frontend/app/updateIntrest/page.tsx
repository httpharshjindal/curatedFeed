'use client'
import { UpdateInterest } from '@/components/UpdateInterest'
import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function Bookmarks() {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <h1 className='top-30 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-sm font-bold sm:top-10 md:text-2xl'>
        Update Intrests
      </h1>
      <div>
        <UpdateInterest open={open} setOpen={setOpen}/>
      </div>
    </div>
  )
}
