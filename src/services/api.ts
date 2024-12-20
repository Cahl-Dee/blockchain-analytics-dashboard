interface TimeseriesDataPoint {
  date: string;
  value: number;
}

interface TimeseriesResponse {
  chain: string;
  metric: string;
  period: string;
  dataPoints: TimeseriesDataPoint[];
}

export async function fetchLineChartData(
  days: number,
  chainId: string,
  metric: string,
  date?: string
): Promise<TimeseriesResponse> {
  const response = await fetch(
    `/api/metrics-data?days=${days}&chain=${chainId}&date=${
      date || ""
    }&metric=${metric}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics data: ${response.statusText}`);
  }
  return response.json();
}

export interface DebugDataPoint {
  date: string;
  lastUpdated: string;
  numBlocks: number;
  numFailedBlocks: number;
  numProcessedBlocks: number;
  isSequentialWithNextDay: boolean;
}

export interface DebugDataResponse {
  chain: string;
  data: DebugDataPoint[];
  pagination: {
    offset: number;
    limit: number;
    hasMore: boolean;
    nextOffset: number;
  };
}

export async function fetchDebugData(): Promise<DebugDataResponse> {
  const response = await fetch("/api/debug-data");
  if (!response.ok) {
    throw new Error(`Failed to fetch debug data: ${response.statusText}`);
  }
  return response.json();
}
