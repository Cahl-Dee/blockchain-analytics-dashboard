"use client";

import { CustomLineChart } from "@/components/CustomLineChart";
import { Controls } from "@/components/Controls";
import { Suspense, useEffect } from "react";
import { metrics } from "@/config/metrics";
import { chains } from "@/config/chains";
import { useState } from "react";

export default function Home() {
  // Initialize state with localStorage value if available, otherwise use default
  const [enabledChains, setEnabledChains] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("enabledChains");
      if (saved) {
        const parsedChains = JSON.parse(saved);
        interface SavedChain {
          id: string;
        }

        return parsedChains
          .map((savedChain: SavedChain): Chain | undefined =>
            chains.find((c: Chain): boolean => c.id === savedChain.id)
          )
          .filter((chain: Chain | undefined): chain is Chain => Boolean(chain));
      }
    }
    return chains.filter((chain) => chain.enabled);
  });

  // Save to localStorage whenever enabledChains changes
  useEffect(() => {
    localStorage.setItem("enabledChains", JSON.stringify(enabledChains));
  }, [enabledChains]);

  const [selectedDays, setSelectedDays] = useState(90);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const toggleChain = (chainId: string) => {
    const chain = chains.find((c) => c.id === chainId);
    if (!chain) return;

    setEnabledChains((current: Chain[]): Chain[] =>
      current.some((c: Chain): boolean => c.id === chainId)
        ? current.filter((c: Chain): boolean => c.id !== chainId)
        : [...current, chain]
    );
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100 dark:bg-navy-950">
      <div className="max-w-[1800px] mx-auto px-4 mb-8">
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
interface Chain {
  id: string;
  name: string;
  enabled: boolean;
}
