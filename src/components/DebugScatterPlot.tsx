import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DebugDataPoint {
  date: string;
  lastUpdated: string;
  numBlocks: number;
  numFailedBlocks: number;
  numProcessedBlocks: number;
  isSequentialWithNextDay: boolean;
}

interface DebugScatterPlotProps {
  data?: DebugDataPoint[];
}

export function DebugScatterPlot({ data = [] }: DebugScatterPlotProps) {
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
    // Add size property based on number of blocks
    size: Math.max(Math.min(point.numBlocks / 1000, 800), 100), // Scale size between 100-800
  }));

  // Get min and max dates from lastUpdated timestamps
  const timestamps = formattedData.map((d) => d.lastUpdated);
  const minDate = new Date(Math.min(...timestamps));
  const maxDate = new Date(Math.max(...timestamps));

  // Generate array of all days between min and max
  const dailyTicks: number[] = [];
  const currentDate = new Date(minDate);
  currentDate.setHours(0, 0, 0, 0); // Start at beginning of day

  while (currentDate <= maxDate) {
    dailyTicks.push(currentDate.getTime());
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort ticks chronologically
  const tickValues = dailyTicks.sort((a, b) => a - b);

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
            ticks={tickValues}
            domain={[Math.min(...tickValues), Math.max(...tickValues)]}
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
