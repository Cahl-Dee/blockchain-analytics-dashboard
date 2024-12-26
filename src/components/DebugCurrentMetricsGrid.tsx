import React, { useState } from "react";

interface MetricsProps {
  currentlyProcessing: {
    date: string;
    blocksProcessed: number;
    lastProcessedBlock: {
      number: number;
      timestamp: number;
    };
    medianBlockProcessingTime: number;
  } | null;
  estimatedDailyBlocks?: number | null;
  historicalMedianProcessingTime?: number | null;
}

export function DebugCurrentMetricsGrid({
  currentlyProcessing,
  estimatedDailyBlocks,
  historicalMedianProcessingTime,
}: MetricsProps) {
  const [showUTC, setShowUTC] = useState(false);

  const formatTimestamp = (timestamp: number) => {
    if (showUTC) {
      // Convert to UTC by adding the timezone offset
      const date = new Date(timestamp * 1000);
      const utcDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60000
      );
      return utcDate.toLocaleString();
    } else {
      // Show in local timezone
      return new Date(timestamp * 1000).toLocaleString();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {currentlyProcessing && (
        <>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-500">
              Currently Processing
            </h3>
            <p className="text-2xl font-bold">
              Date (UTC): {currentlyProcessing.date}
            </p>
            <p className="text-sm text-gray-600">
              Completed Blocks:{" "}
              {currentlyProcessing.blocksProcessed?.toLocaleString()}
              {currentlyProcessing.blocksProcessed && estimatedDailyBlocks
                ? ` (est: ${(
                    (currentlyProcessing.blocksProcessed /
                      estimatedDailyBlocks) *
                    100
                  ).toFixed(2)}%)`
                : ""}
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
              Block Time (
              <span
                className="cursor-pointer hover:text-blue-500 underline"
                onClick={() => setShowUTC(!showUTC)}
              >
                {showUTC ? "UTC" : "local"}
              </span>
              ):{" "}
              {formatTimestamp(
                currentlyProcessing.lastProcessedBlock?.timestamp
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-500">
              Median Sec Between Blocks Processed
            </h3>
            <p className="text-2xl font-bold">
              Currently processing day:{" "}
              {(currentlyProcessing.medianBlockProcessingTime / 1000).toFixed(
                3
              )}
            </p>{" "}
            {historicalMedianProcessingTime != null &&
              !isNaN(historicalMedianProcessingTime) && (
                <p className="text-sm text-gray-600">
                  Previously Processed Days:{" "}
                  {(historicalMedianProcessingTime / 1000).toFixed(3)}
                </p>
              )}
          </div>
        </>
      )}
    </div>
  );
}
