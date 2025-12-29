import { cn } from '@/lib/utils'
import React from 'react'

const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <main className={cn("w-full max-w-7xl mx-auto p-4", className)}>
        {children}
    </main>
  )
}

export default Container