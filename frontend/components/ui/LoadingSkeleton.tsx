import ArticleCardSkeleton from "./ArticleCardSkeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"

// const HeaderSkeleton = () => {
//   return (
//     <header className='py-4'>
//       <nav className='container flex items-center justify-between'>
//         <ul className='flex gap-10 text-sm font-medium'>
//           <li>
//             <Skeleton className="h-4 w-16" /> {/* Home link */}
//           </li>
//         </ul>
//         <div className='flex items-center justify-between gap-6'>
//           <Skeleton className="h-8 w-8 rounded-full" /> {/* Theme toggle */}
//           <Skeleton className="h-8 w-20" /> {/* Sign in/User button */}
//         </div>
//       </nav>
//     </header>
//   )
// }

const LoadingSkeleton = () => {
  return (
    <>
      {/* <HeaderSkeleton /> */}
      <section>
        <Tabs defaultValue='discover' className='w-full'>
          <TabsList className='w-full justify-around'>
            <TabsTrigger
              value='discover'
              className='h-full w-full'
              disabled
            >
              Discover
            </TabsTrigger>
            <SignedIn>
              <TabsTrigger value='intrest' className='w-full' disabled>
                Interest
              </TabsTrigger>
            </SignedIn>
            <SignedOut>
              <SignInButton mode='modal'>
                <TabsTrigger value='intrest' className='w-full' disabled>
                  Interest
                </TabsTrigger>
              </SignInButton>
            </SignedOut>
          </TabsList>
          <div className='space-y-4 py-4'>
            {[1, 2, 3].map(i => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </Tabs>
      </section>
    </>
  )
}

export default LoadingSkeleton
