import React from "react";

interface MetricsProps {
  currentlyProcessing: {
    date: string;
    blocksProcessed: number;
    lastProcessedBlock: {
      number: number;
      timestamp: number;
    };
    medianSecBetweenBlocks: number;
  } | null;
}

export function DebugCurrentMetricsGrid({ currentlyProcessing }: MetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {currentlyProcessing && (
        <>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-500">
              Currently Processing
            </h3>
            <p className="text-2xl font-bold">
              Date: {currentlyProcessing.date}
            </p>
            <p className="text-sm text-gray-600">
              Completed Blocks:{" "}
              {currentlyProcessing.blocksProcessed?.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-500">
              Last Processed
            </h3>
            <p className="text-2xl font-bold">
              Block #:{" "}
              {currentlyProcessing.lastProcessedBlock?.number.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Block Time:{" "}
              {new Date(
                currentlyProcessing.lastProcessedBlock?.timestamp * 1000
              ).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-500">
              Median Processing Time
            </h3>
            <p className="text-2xl font-bold">
              {currentlyProcessing.medianSecBetweenBlocks?.toFixed(3)}
            </p>
            <p className="text-sm text-gray-600">sec/block</p>
          </div>
        </>
      )}
    </div>
  );
}
