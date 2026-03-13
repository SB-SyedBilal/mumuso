import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mumuso POS Terminal',
  description: 'Mock POS Terminal for Client Demo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
