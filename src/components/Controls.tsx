import { Chain } from "@/config/chains";
import { timeframes } from "@/config/timeframes";
import { chains } from "@/config/chains";
import { ChainToggle } from "@/components/ChainToggle";

interface ControlsProps {
  enabledChains: Chain[];
  selectedDays: number;
  selectedDate: string;
  onToggleChain: (chainId: string) => void;
  onDaysChange: (days: number) => void;
  onDateChange: (date: string) => void;
}

export const Controls = ({
  enabledChains,
  selectedDays,
  selectedDate,
  onToggleChain,
  onDaysChange,
  onDateChange,
}: ControlsProps) => (
  <div className="flex flex-wrap mb-8 gap-4 p-4 bg-white rounded-lg shadow-lg">
    <div className="flex items-center space-x-4">
      {chains.map((chain) => (
        <ChainToggle
          key={chain.id}
          chain={chain}
          enabled={enabledChains.some((c) => c.id === chain.id)}
          onToggle={onToggleChain}
        />
      ))}
    </div>
    <div className="flex items-center space-x-4">
      <select
        value={selectedDays}
        onChange={(e) => onDaysChange(Number(e.target.value))}
        className="px-3 py-2 border rounded"
      >
        {timeframes.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
        className="px-3 py-2 border rounded hidden"
      />
    </div>
  </div>
);
