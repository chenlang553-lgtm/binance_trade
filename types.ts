export interface Position {
  symbol: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  leverage: number;
  marginType: 'Cross' | 'Isolated';
}

export interface Strategy {
  id: string;
  name: string;
  code: string;
  status: 'running' | 'stopped' | 'error';
  startTime?: string;
  endTime?: string;
  lastRun?: string;
  logs: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'TRADE';
  message: string;
}

export interface AccountInfo {
  totalBalance: number;
  unrealizedPnL: number;
  marginBalance: number;
  availableBalance: number;
}

export enum Tab {
  DASHBOARD = 'DASHBOARD',
  STRATEGIES = 'STRATEGIES',
  SETTINGS = 'SETTINGS'
}