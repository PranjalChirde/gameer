import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Gameer — Golf that Gives Back',
  description: 'Subscribe, enter your golf scores, win prizes and support your chosen charity every month.',
  keywords: ['golf', 'charity', 'subscription', 'draw', 'prizes', 'stableford'],
  openGraph: {
    title: 'Gameer — Golf that Gives Back',
    description: 'Play golf, win prizes, and fund causes that matter. Every subscription supports a charity of your choice.',
    type: 'website',
    locale: 'en_GB',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
