"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DebugScatterPlot } from "@/components/DebugScatterPlot";
import {
  fetchDebugDataProcessedDays,
  fetchDebugDataCurrentlyProcessing,
  DebugDataProcessedDaysPoint,
  DebugDataCurrentlyProcesing,
} from "@/services/api";
import { chains } from "@/config/chains";

export default function Home() {
  const [processedDays, setProcessedDays] = useState<
    DebugDataProcessedDaysPoint[]
  >([]);
  const [currentlyProcessing, setCurrentlyProcessing] =
    useState<DebugDataCurrentlyProcesing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChain, setSelectedChain] = useState("base");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [processedDaysResp, currentlyProcessingResp] = await Promise.all([
          fetchDebugDataProcessedDays(selectedChain),
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

    loadData();
  }, [selectedChain]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
        </div>
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
              {currentlyProcessing?.blocksProcessed.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-500">
              Last Processed
            </h3>
            <p className="text-2xl font-bold">
              Block #:{" "}
              {currentlyProcessing?.lastProcessedBlock.number.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Block Time:{" "}
              {new Date(
                (currentlyProcessing?.lastProcessedBlock?.timestamp ?? 0) * 1000
              ).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-500">
              Median Processing Time
            </h3>
            <p className="text-2xl font-bold">
              {currentlyProcessing?.medianSecBetweenBlocks.toFixed(3)}
            </p>
            <p className="text-sm text-gray-600">sec/block</p>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-4">Processed Days</h2>
        <DebugScatterPlot data={processedDays} />
      </div>
    </main>
  );
}
