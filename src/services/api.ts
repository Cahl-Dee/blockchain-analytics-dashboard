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

export interface DebugDataProcessedDaysPoint {
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

export interface DebugDataProcessedDaysResponse {
  chain: string;
  data: DebugDataProcessedDaysPoint[];
  pagination: {
    offset: number;
    limit: number;
    hasMore: boolean;
    nextOffset: number;
  };
}

export async function fetchDebugDataProcessedDays(
  chain: string,
  days: number
): Promise<DebugDataProcessedDaysResponse> {
  const response = await fetch(
    `/api/debug-data-processed-days?chain=${chain}&days=${days}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch debug data");
  }
  return response.json();
}

export interface DebugDataCurrentlyProcesing {
  chain: string;
  date: string;
  blocksProcessed: number;
  lastProcessedBlock: {
    number: number;
    timestamp: number;
  };
  medianBlockProcessingTime: number;
}

export async function fetchDebugDataCurrentlyProcessing(
  chain: string = "base"
): Promise<DebugDataCurrentlyProcesing> {
  const response = await fetch(
    `/api/debug-data-currently-processing?chain=${chain}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch current metrics");
  }
  return response.json();
}
