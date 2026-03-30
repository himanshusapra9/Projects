import Link from "next/link";
import { MerchantDashboard } from "@/components/dashboard/MerchantDashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-surface-light">
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-navy-950"
          >
            ← Home
          </Link>
          <Link
            href="/demo"
            className="text-sm font-medium text-accent hover:underline"
          >
            Product demo
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <MerchantDashboard />
      </div>
    </div>
  );
}
