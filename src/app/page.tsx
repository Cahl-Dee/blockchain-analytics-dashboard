"use client";

import { CustomLineChart } from "@/components/CustomLineChart";
import { Controls } from "@/components/Controls";
import { Suspense } from "react";
import { metrics } from "@/config/metrics";
import { chains } from "@/config/chains";
import { useState } from "react";

export default function Home() {
  const [enabledChains, setEnabledChains] = useState(
    chains.filter((chain) => chain.enabled)
  );
  const [selectedDays, setSelectedDays] = useState(90);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const toggleChain = (chainId: string) => {
    const chain = chains.find((c) => c.id === chainId);
    if (!chain) return;

    setEnabledChains((current) =>
      current.some((c) => c.id === chainId)
        ? current.filter((c) => c.id !== chainId)
        : [...current, chain]
    );
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-[1800px] mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Chain Metrics Dashboard</h1>
        <Controls
          enabledChains={enabledChains}
          selectedDays={selectedDays}
          selectedDate={selectedDate}
          onToggleChain={toggleChain}
          onDaysChange={setSelectedDays}
          onDateChange={setSelectedDate}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {metrics.map((metric) => (
            <div key={metric.id} className="w-full">
              <h2 className="text-xl font-semibold mb-4">{metric.name}</h2>
              <Suspense fallback={<div>Loading chart...</div>}>
                <CustomLineChart
                  metricId={metric.id}
                  enabledChains={enabledChains}
                  selectedDays={selectedDays}
                  selectedDate={selectedDate}
                />
              </Suspense>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
