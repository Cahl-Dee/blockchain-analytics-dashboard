import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useEffect } from "react";

interface DebugDataPoint {
  date: string;
  lastUpdated: string;
  numBlocks: number;
  numFailedBlocks: number;
  numProcessedBlocks: number;
  isSequentialWithNextDay: boolean;
  medianBlockProcessingTime: number;
  firstBlockNum: number;
  lastBlockNum: number;
}

interface DebugScatterPlotProps {
  data?: DebugDataPoint[];
  onMedianBlocksCalculated?: (medianBlocks: number) => void;
  onMedianProcessingTimeCalculated?: (medianTime: number) => void;
}

export function DebugScatterPlot({
  data = [],
  onMedianBlocksCalculated,
  onMedianProcessingTimeCalculated,
}: DebugScatterPlotProps) {
  // Calculate median blocks per day
  useEffect(() => {
    if (data.length > 0) {
      // Existing blocks calculation
      const blockCounts = data
        .filter((point) => point.numBlocks > 0)
        .map((point) => point.numBlocks)
        .sort((a, b) => a - b);

      const blocksMid = Math.floor(blockCounts.length / 2);
      const medianBlocks =
        blockCounts.length % 2 === 0
          ? Math.round(
              (blockCounts[blocksMid - 1] + blockCounts[blocksMid]) / 2
            )
          : blockCounts[blocksMid];

      // New processing time calculation
      const processingTimes = data
        .filter((point) => point.medianBlockProcessingTime > 0)
        .map((point) => point.medianBlockProcessingTime)
        .sort((a, b) => a - b);

      const timesMid = Math.floor(processingTimes.length / 2);
      const medianTime =
        processingTimes.length % 2 === 0
          ? (processingTimes[timesMid - 1] + processingTimes[timesMid]) / 2
          : processingTimes[timesMid];

      onMedianBlocksCalculated?.(medianBlocks);
      onMedianProcessingTimeCalculated?.(medianTime);
    }
  }, [data, onMedianBlocksCalculated, onMedianProcessingTimeCalculated]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[800px] bg-white p-4 rounded-lg shadow flex items-center justify-center">
        <p>No data available</p>
      </div>
    );
  }

  const formattedData = data.map((point) => ({
    date: point.date,
    lastUpdated: new Date(point.lastUpdated).getTime(),
    numBlocks: point.numBlocks,
    numFailedBlocks: point.numFailedBlocks,
    isSequentialWithNextDay: point.isSequentialWithNextDay,
    medianBlockProcessingTime: point.medianBlockProcessingTime,
    firstBlockNum: point.firstBlockNum,
    lastBlockNum: point.lastBlockNum,
    size: Math.max(Math.min(point.numBlocks / 1000, 800), 100), // Scale size between 100-800
  }));

  const yDates = data.map((d) => d.date).sort();
  const yAxisTicks = generateDateTicks(
    new Date(yDates[0]),
    new Date(yDates[yDates.length - 1])
  );
  const xTimestamps = data.map((d) => new Date(d.lastUpdated).getTime());
  const xAxisTicks = generateDateTicks(
    new Date(Math.min(...xTimestamps)),
    new Date(Math.max(...xTimestamps))
  );

  const getPointColor = (point: {
    numFailedBlocks: number;
    isSequentialWithNextDay: boolean;
  }) => {
    return point.numFailedBlocks > 0 || point.isSequentialWithNextDay === false
      ? "#ff0000" // red
      : "#0000ff"; // blue
  };

  return (
    <div className="w-full h-[800px] bg-white p-4 rounded-lg shadow">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 40, bottom: 60, left: 80 }}>
          <XAxis
            type="number"
            dataKey="lastUpdated"
            name="Processed At"
            label={{
              value: "Processed At",
              position: "bottom",
              offset: 40,
            }}
            ticks={xAxisTicks}
            tickFormatter={(timestamp) =>
              new Date(timestamp).toLocaleDateString()
            }
            domain={["dataMin", "dataMax"]}
          />
          <YAxis
            type="number"
            dataKey={(item) => new Date(item.date).getTime()}
            name="Date"
            label={{
              value: "Date to Process",
              angle: -90,
              position: "insideLeft",
              offset: -70,
            }}
            ticks={yAxisTicks}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp);
              return `${
                date.getUTCMonth() + 1
              }/${date.getUTCDate()}/${date.getUTCFullYear()}`;
            }}
            domain={["dataMin", "dataMax"]}
            padding={{ top: 20, bottom: 20 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload[0]) return null;

              const data = payload[0].payload;
              return (
                <div className="bg-white p-4 border rounded shadow">
                  <p className="font-bold">Date: {data.date}</p>
                  <p>
                    Processed At: {new Date(data.lastUpdated).toLocaleString()}
                  </p>
                  <p>
                    Median Processing Time:{" "}
                    {(data.medianBlockProcessingTime / 1000).toFixed(3)}s
                  </p>
                  <p>First Block #: {data.firstBlockNum.toLocaleString()}</p>
                  <p>Last Block #: {data.lastBlockNum.toLocaleString()}</p>
                  <p>Total Blocks: {data.numBlocks.toLocaleString()}</p>
                  <p>Failed Blocks: {data.numFailedBlocks.toLocaleString()}</p>
                  <p>
                    Sequential: {data.isSequentialWithNextDay ? "Yes" : "No"}
                  </p>
                </div>
              );
            }}
          />
          <Scatter data={formattedData}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getPointColor(entry)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

const generateDateTicks = (startDate: Date, endDate: Date) => {
  const dates: Date[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates.map((d) => d.getTime());
};
