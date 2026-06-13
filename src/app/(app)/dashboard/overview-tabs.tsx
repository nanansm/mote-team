"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function OverviewTabs({
  summary,
  control,
  defaultTab = "ringkasan",
}: {
  summary: React.ReactNode;
  control: React.ReactNode;
  defaultTab?: string;
}) {
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
        <TabsTrigger value="kontrol">Kontrol</TabsTrigger>
      </TabsList>
      <TabsContent value="ringkasan" className="mt-5">
        {summary}
      </TabsContent>
      <TabsContent value="kontrol" className="mt-5">
        {control}
      </TabsContent>
    </Tabs>
  );
}
