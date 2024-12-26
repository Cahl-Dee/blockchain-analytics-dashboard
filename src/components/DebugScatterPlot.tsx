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

const getXAxisDateRange = (data: DebugDataPoint[]) => {
  const timestamps = data.map((d) => new Date(d.lastUpdated).getTime());
  return {
    minDate: new Date(Math.min(...timestamps)),
    maxDate: new Date(Math.max(...timestamps)),
  };
};

const getYAxisDateRange = (data: DebugDataPoint[]) => {
  const dates = data.map((d) => d.date).sort();
  return {
    minDate: new Date(dates[0]),
    maxDate: new Date(dates[dates.length - 1]),
  };
};

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

  return {
    dateTicks: dates.map((d) => d.toISOString().split("T")[0]),
    timestampTicks: dates.map((d) => d.getTime()),
  };
};

interface DebugDataPoint {
  date: string;
  lastUpdated: string;
  numBlocks: number;
  numFailedBlocks: number;
  numProcessedBlocks: number;
  isSequentialWithNextDay: boolean;
  medianBlockProcessingTime: number;
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
    size: Math.max(Math.min(point.numBlocks / 1000, 800), 100), // Scale size between 100-800
  }));

  const xAxisRange = getXAxisDateRange(data);
  const yAxisRange = getYAxisDateRange(data);

  const xAxisTicks = generateDateTicks(
    xAxisRange.minDate,
    xAxisRange.maxDate
  ).timestampTicks;
  const yAxisTicks = generateDateTicks(
    yAxisRange.minDate,
    yAxisRange.maxDate
  ).dateTicks;

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
            tickFormatter={(unixTime) =>
              new Date(unixTime).toLocaleDateString()
            }
            ticks={xAxisTicks}
            domain={[Math.min(...xAxisTicks), Math.max(...xAxisTicks)]}
          />
          <YAxis
            type="category"
            dataKey="date"
            name="Date"
            label={{
              value: "Date to Process",
              angle: -90,
              position: "insideLeft",
              offset: -70,
            }}
            ticks={yAxisTicks}
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
