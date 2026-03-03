"use client"

import { ResizablePanelGroup } from '@/components/ui/resizable'
import useMediaQuery from '@/hooks/use-media-query'
import { ReactNode } from 'react'
import Header from '@/components/header'

const DahboardLayout = ({children}: {children: ReactNode}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")

   return (
    <div className='bg-gray-300 dark:bg-[#15161a]'>
      <Header />
        <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
            {children}
        </ResizablePanelGroup>
    </div>
  )
}

export default DahboardLayout
