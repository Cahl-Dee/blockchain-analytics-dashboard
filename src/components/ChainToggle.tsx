import { Chain } from "@/config/chains";

interface ChainToggleProps {
  chain: Chain;
  enabled: boolean;
  onToggle: (chainId: string) => void;
}

export const ChainToggle = ({ chain, enabled, onToggle }: ChainToggleProps) => (
  <button
    onClick={() => onToggle(chain.id)}
    className={`
      px-4 py-2 
      rounded-full 
      text-sm font-medium 
      transition-colors
      ${enabled ? "text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}
    `}
    style={enabled ? { backgroundColor: chain.color } : undefined}
  >
    {chain.name}
  </button>
);
