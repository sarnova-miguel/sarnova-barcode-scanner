import { cn } from '@/lib/utils'
import React from 'react'

const Container = ({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) => {
  return (
    <main id={id} className={cn("w-full max-w-7xl mx-auto p-4 md:py-8", className)} role='main'>
        {children}
    </main>
  )
}

export default Container