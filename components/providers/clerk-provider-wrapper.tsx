"use client"

import type { ReactNode } from "react"

export function ClerkProviderWrapper({
  children,
}: {
  children: ReactNode
  publishableKey: string
}) {
  return (
    <>
      {children}
    </>
  )
}
