import ArticleCardSkeleton from "./ArticleCardSkeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"


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
