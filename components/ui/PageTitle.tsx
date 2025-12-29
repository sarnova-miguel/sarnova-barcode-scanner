import { cn } from '@/lib/utils'
import React from 'react'

const PageTitle = ({children, className} : {children: React.ReactNode; className?: string}) => {
  return (
    <h1 className={cn("text-center md:text-left text-2xl md:text-4xl font-bold mb-4", className)}>
        {children}
    </h1>
  )
}

export default PageTitle