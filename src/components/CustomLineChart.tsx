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

const formatValue = (value: number): string => {
  if (value === 0) return "0";

  // Format small numbers
  if (Math.abs(value) < 0.01) {
    return value.toFixed(6);
  }

  // Format medium numbers
  if (Math.abs(value) < 1000) {
    return value.toFixed(4);
  }

  // Format large numbers with commas
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

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
          labelFormatter={formatDateDisplay}
          formatter={(value: number, name: string) => {
            const chain = enabledChains.find((c) => c.id === name);
            return [formatValue(value), chain?.name || name];
          }}
        />
        <Legend
          onMouseEnter={handleLegendHover}
          onMouseLeave={handleLegendUnhover}
          onClick={handleLegendClick}
          formatter={(value, entry) => (
            <span
              style={{
                color: hiddenChains.has(entry.dataKey) ? "#999" : entry.color,
                opacity: hiddenChains.has(entry.dataKey) ? "0.4" : "1",
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg">
      <ErrorBoundary>
        {error ? (
          <div className="p-4 border border-red-500 rounded bg-red-50">
            <h3 className="text-red-700 font-bold">Error loading chart</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        ) : (
          <div className="p-4">
            <ChartTemplate
              data={data}
              enabledChains={enabledChains}
              metricId={metricId}
            />
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};
