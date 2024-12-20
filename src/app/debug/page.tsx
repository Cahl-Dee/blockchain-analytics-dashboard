"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DebugScatterPlot } from "@/components/DebugScatterPlot";
import { fetchDebugData } from "@/services/api";
import { chains } from "@/config/chains";

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChain, setSelectedChain] = useState("base");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchDebugData(selectedChain);
        setData(result.data);
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
        <h2 className="text-xl font-bold mb-4">Processed Days</h2>
        <DebugScatterPlot data={data} />
      </div>
    </main>
  );
}
