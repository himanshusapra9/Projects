import type { ReactNode } from "react";

import "./globals.css";

export const metadata = {
  title: "DataSteward",
  description: "Data Pipeline Health Monitoring",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
