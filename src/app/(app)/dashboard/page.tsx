import { PageHeader } from "@/components/page-header";
import { ControlBoard } from "./control-board";
import { DashboardSummary } from "./dashboard-summary";
import { OverviewTabs } from "./overview-tabs";

export const dynamic = "force-dynamic";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Ringkasan lintas klien & kontrol lalu lintas task"
      />
      <OverviewTabs
        defaultTab={tab === "kontrol" ? "kontrol" : "ringkasan"}
        summary={<DashboardSummary />}
        control={<ControlBoard />}
      />
    </div>
  );
}
