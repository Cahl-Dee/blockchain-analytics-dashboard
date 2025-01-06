"use client";

import { CustomLineChart } from "@/components/CustomLineChart";
import { Controls } from "@/components/Controls";
import { Suspense, useEffect } from "react";
import { metrics } from "@/config/metrics";
import { chains } from "@/config/chains";
import { useState } from "react";
import { Chain } from "@/config/chains";

export default function Home() {
  const [enabledChains, setEnabledChains] = useState<Chain[]>(() => {
    if (typeof window === "undefined") {
      return chains.filter((chain) => chain.enabled);
    }

    const saved = localStorage.getItem("enabledChains");
    if (saved) {
      try {
        const parsedChains = JSON.parse(saved);
        if (Array.isArray(parsedChains) && parsedChains.length > 0) {
          const validChains = parsedChains
            .map((savedChain: { id: string }) =>
              chains.find((c) => c.id === savedChain.id)
            )
            .filter((chain: Chain | undefined): chain is Chain =>
              Boolean(chain)
            );

          if (validChains.length > 0) {
            return validChains;
          }
        }
      } catch (error) {
        console.error("Error parsing chain state:", error);
      }
    }

    return chains.filter((chain) => chain.enabled);
  });

  useEffect(() => {
    const savedChains = JSON.stringify(enabledChains);
    const currentSaved = localStorage.getItem("enabledChains");

    if (currentSaved !== savedChains) {
      localStorage.setItem("enabledChains", savedChains);
    }
  }, [enabledChains]);

  const [selectedDays, setSelectedDays] = useState(90);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const toggleChain = (chainId: string) => {
    const chain = chains.find((c) => c.id === chainId);
    if (!chain) return;

    setEnabledChains((current: Chain[]) =>
      current.some((c) => c.id === chainId)
        ? current.filter((c) => c.id !== chainId)
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
