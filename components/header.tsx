import React from 'react'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SignedIn, UserButton } from '@clerk/nextjs'

const Header = () => {
  return (
    <div>
      <div className="header flex justify-end p-3 bg-amber-400">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  )
}

export default Header
