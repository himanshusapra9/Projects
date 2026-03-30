import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Discovery Copilot — AI-Powered Product Decisions',
  description: 'Tell us what you need. We\'ll tell you what to buy and why.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
