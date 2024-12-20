export interface Chain {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
}

export const chains: Chain[] = [
  { id: "eth", name: "Ethereum", enabled: true, color: "#627EEA" },
  { id: "base", name: "Base", enabled: true, color: "#0052FF" },
  { id: "op", name: "Optimism", enabled: false, color: "#FF0420" },
  { id: "arb", name: "Arbitrum One", enabled: false, color: "#12AAFF" },
  { id: "poly", name: "Polygon PoS", enabled: false, color: "#8247E5" },
  { id: "bsc", name: "BNB Smart Chain", enabled: false, color: "#F0B90B" },
];
