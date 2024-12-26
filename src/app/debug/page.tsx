"use client";

import { useState } from "react";
import Link from "next/link";
import { DebugScatterPlot } from "@/components/DebugScatterPlot";
import {
  fetchDebugDataProcessedDays,
  fetchDebugDataCurrentlyProcessing,
  DebugDataProcessedDaysPoint,
  DebugDataCurrentlyProcesing,
} from "@/services/api";
import { chains } from "@/config/chains";

const timeframes = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export default function Home() {
  const [processedDays, setProcessedDays] = useState<
    DebugDataProcessedDaysPoint[]
  >([]);
  const [currentlyProcessing, setCurrentlyProcessing] =
    useState<DebugDataCurrentlyProcesing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChain, setSelectedChain] = useState("base");
  const [selectedDays, setSelectedDays] = useState(30);

  const handleDebug = async () => {
    setLoading(true);
    try {
      const [processedDaysResp, currentlyProcessingResp] = await Promise.all([
        fetchDebugDataProcessedDays(selectedChain, selectedDays),
        fetchDebugDataCurrentlyProcessing(selectedChain),
      ]);
      setProcessedDays(processedDaysResp.data);
      setCurrentlyProcessing(currentlyProcessingResp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-[1800px] mx-auto px-4 mb-8">
        <Link href="/">Return Home</Link>
      </div>
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Debug</h1>
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="p-2 border rounded-md"
          >
            {chains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="p-2 border rounded-md"
          >
            {timeframes.map((timeframe) => (
              <option key={timeframe.value} value={timeframe.value}>
                {timeframe.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleDebug}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Debug"}
          </button>
        </div>

        {error && <div className="text-red-500 mb-4">Error: {error}</div>}

        {currentlyProcessing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-500">
                Currently Processing
              </h3>
              <p className="text-2xl font-bold">
                Date: {currentlyProcessing?.date}
              </p>
              <p className="text-sm text-gray-600">
                Completed Blocks:{" "}
                {currentlyProcessing?.blocksProcessed?.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-500">
                Last Processed
              </h3>
              <p className="text-2xl font-bold">
                Block #:{" "}
                {currentlyProcessing?.lastProcessedBlock?.number?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Block Time:{" "}
                {new Date(
                  (currentlyProcessing?.lastProcessedBlock?.timestamp ?? 0) *
                    1000
                ).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-500">
                Median Processing Time
              </h3>
              <p className="text-2xl font-bold">
                {currentlyProcessing?.medianSecBetweenBlocks?.toFixed(3)}
              </p>
              <p className="text-sm text-gray-600">sec/block</p>
            </div>
          </div>
        )}

        {processedDays.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4">Processed Days</h2>
            <DebugScatterPlot data={processedDays} />
          </>
        )}
      </div>
    </main>
  );
}
