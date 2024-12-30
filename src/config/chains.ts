export interface Chain {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
}

export const chains: Chain[] = [
  { id: "eth", name: "Ethereum", enabled: true, color: "#627EEA" },
  { id: "base", name: "Base", enabled: true, color: "#0052FF" },
  { id: "op", name: "Optimism", enabled: true, color: "#FF0420" },
  { id: "arb", name: "Arbitrum One", enabled: true, color: "#12AAFF" },
  { id: "nova", name: "Arbitrum Nova", enabled: false, color: "#e1883b" },
  { id: "zora", name: "Zora", enabled: false, color: "#4c7ef5" },
  { id: "zksync", name: "zkSync Era", enabled: false, color: "#8c8dfc" },
  { id: "scroll", name: "Scroll", enabled: false, color: "#10151b" },
  { id: "blast", name: "Blast", enabled: false, color: "#9ba885" },
];
