"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DebugScatterPlot } from "@/components/DebugScatterPlot";
import { fetchDebugData } from "@/services/api";

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchDebugData();
        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        <h1 className="text-3xl font-bold mb-8">Debug</h1>
        <h2 className="text-xl font-bold mb-4">Processed Days</h2>
        <DebugScatterPlot data={data} />
      </div>
    </main>
  );
}
