import type { ReactNode } from 'react'

import './globals.css'

export const metadata = {
  title: 'OmniResearch',
  description: 'Multi-Source Intelligence Research',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
