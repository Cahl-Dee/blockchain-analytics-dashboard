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
