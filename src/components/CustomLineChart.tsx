"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchLineChartData } from "@/services/api";
import { ErrorBoundary } from "./ErrorBoundary";
import { Chain } from "@/config/chains";

interface ChainData {
  [chainId: string]: number;
}

interface ChartDataPoint {
  formattedDate: string;
  [chainId: string]: number | string;
}

interface LineChartProps {
  metricId: string;
  enabledChains: Chain[];
  selectedDays: number;
  selectedDate: string;
}

const formatYAxisTick = (value: number): string => {
  if (value === 0) return "0";

  const absValue = Math.abs(value);

  if (absValue >= 1000000) {
    return `${(value / 1000000).toFixed(1).slice(0, 3)}M`;
  }

  if (absValue >= 1000) {
    return `${(value / 1000).toFixed(1).slice(0, 3)}K`;
  }

  if (absValue < 1) {
    return value.toFixed(3);
  }

  return value.toFixed(1);
};

const formatDateDisplay = (dateStr: string): string => {
  const [, month, day] = dateStr.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(month) - 1]} ${parseInt(day)}`;
};

const ChartTemplate = ({
  data,
  enabledChains,
}: {
  data: ChartDataPoint[];
  enabledChains: Chain[];
}) => {
  const [hiddenChains, setHiddenChains] = useState<Set<string>>(new Set());
  const [hoveredChain, setHoveredChain] = useState<string | null>(null);

  const handleLegendClick = (e: any) => {
    const chainId = e.dataKey;
    setHiddenChains((prev) => {
      const next = new Set(prev);
      if (next.has(chainId)) {
        next.delete(chainId);
      } else {
        next.add(chainId);
      }
      return next;
    });
  };

  const handleLegendHover = (o: any) => {
    setHoveredChain(o.dataKey);
  };

  const handleLegendUnhover = () => {
    setHoveredChain(null);
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="formattedDate" tickFormatter={formatDateDisplay} />
        <YAxis tickFormatter={formatYAxisTick} />
        <Tooltip
          content={({ payload, label }) => {
            if (!payload?.length) return null;

            // Find smallest absolute value
            const smallestAbs = Math.min(
              ...payload.map((item) => Math.abs(item.value as number))
            );

            // Determine format based on smallest value
            const getFormat = () => {
              if (smallestAbs < 0.01) return (n: number) => n.toFixed(6);
              if (smallestAbs < 1000) return (n: number) => n.toFixed(4);
              return (n: number) =>
                n.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                });
            };

            const formatFunc = getFormat();
            const sortedPayload = [...payload].sort(
              (a, b) => (b.value as number) - (a.value as number)
            );

            return (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                }}
              >
                <div style={{ padding: "2px 0", margin: "0" }}>
                  {formatDateDisplay(label)}
                </div>
                {sortedPayload.map(({ value, name, color }) => {
                  const chain = enabledChains.find((c) => c.id === name);
                  return (
                    <div
                      key={name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "240px",
                        gap: "8px",
                        alignItems: "center",
                        margin: "0",
                      }}
                    >
                      <span
                        style={{ flex: "1 1 150px", textAlign: "right", color }}
                      >
                        {(value as number) === 0
                          ? "0"
                          : formatFunc(value as number)}
                      </span>
                      <span style={{ flex: "0 0 120px", color }}>
                        {chain?.name || name}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          }}
        />
        <Legend
          onMouseEnter={handleLegendHover}
          onMouseLeave={handleLegendUnhover}
          onClick={handleLegendClick}
          formatter={(value, entry) => (
            <span
              style={{
                color: hiddenChains.has(entry.payload?.value)
                  ? "#999"
                  : entry.color,
                opacity: hiddenChains.has(entry.payload?.value) ? "0.4" : "1",
                cursor: "pointer",
              }}
            >
              {value}
            </span>
          )}
        />
        {enabledChains.map((chain) => (
          <Line
            key={chain.id}
            type="monotone"
            dataKey={chain.id}
            name={chain.name}
            stroke={chain.color}
            strokeOpacity={
              hiddenChains.has(chain.id)
                ? 0
                : hoveredChain && hoveredChain !== chain.id
                ? 0.4
                : 1
            }
            dot={false}
            hide={hiddenChains.has(chain.id)}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export const CustomLineChart = ({
  metricId,
  enabledChains,
  selectedDays,
  selectedDate,
}: LineChartProps) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const responses = await Promise.all(
          enabledChains.map(async (chain) => {
            const response = await fetchLineChartData(
              selectedDays,
              chain.id,
              metricId,
              selectedDate || undefined
            );
            return { chain: chain.id, data: response };
          })
        );

        if (!isMounted) return;

        const mergedData: { [date: string]: ChainData } = {};

        responses.forEach(({ chain, data }) => {
          if (!data.dataPoints?.length) {
            console.warn(`No data points for chain ${chain}`);
            return;
          }

          data.dataPoints.forEach((point) => {
            const date = point.date;
            if (!mergedData[date]) {
              mergedData[date] = {};
            }
            mergedData[date][chain] = Number(point.value.toFixed(7));
          });
        });

        const formattedData = Object.entries(mergedData)
          .map(([date, values]) => ({
            formattedDate: date,
            ...values,
          }))
          .sort((a, b) => a.formattedDate.localeCompare(b.formattedDate));

        setData(formattedData);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [enabledChains, selectedDays, selectedDate, metricId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-500 dark:border-blue-400" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <ErrorBoundary>
        {error ? (
          <div className="p-4 border border-red-500 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-700">
            <h3 className="text-red-700 dark:text-red-400 font-bold">
              Error loading chart
            </h3>
            <p className="text-red-600 dark:text-red-300">{error.message}</p>
          </div>
        ) : (
          <div className="p-4">
            <ChartTemplate data={data} enabledChains={enabledChains} />
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};
