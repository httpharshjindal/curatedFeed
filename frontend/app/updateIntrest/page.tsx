'use client'
import { UpdateInterest } from '@/components/UpdateInterest'

export default function Bookmarks() {
  return (
    <div>
      <h1 className='top-30 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-sm font-bold sm:top-10 md:text-2xl'>
        Update Intrests
      </h1>
      <div>
        <UpdateInterest open={true} setOpen={() => {}} />
      </div>
    </div>
  )
}
