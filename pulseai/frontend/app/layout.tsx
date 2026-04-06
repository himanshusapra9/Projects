import type { ReactNode } from "react";

import "./globals.css";

export const metadata = {
  title: "PulseAI",
  description: "Customer Signal Analysis",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
