"use client"
import { SignedIn, UserButton } from '@clerk/nextjs'
import { ModeToggle } from './darkmode'

const Header = () => {
  return (
    <div className='flex p-3 bg-linear-to-r text-amber-500 dark:text-white from-[#22262b] to-purple-800 to-90% relative'>
      <div className='text-2xl font-bold'>
        <i>PDFPOD</i>
      </div>
      <div className="flex flex-1 justify-end w-full mr-4 gap-3">
          <ModeToggle />
          <SignedIn>
            <UserButton />
          </SignedIn>
      </div>
    </div>
  )
}

export default Header
