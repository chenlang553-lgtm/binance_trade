import React, { useState, useEffect } from 'react';
import { Tab, Position, AccountInfo, Strategy } from './types';
import AccountOverview from './components/AccountOverview';
import PositionTable from './components/PositionTable';
import StrategyEditor from './components/StrategyEditor';
import { ChartIcon, CodeIcon, WalletIcon } from './components/Icons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Default Fallback
const DEFAULT_ACCOUNT: AccountInfo = {
  totalBalance: 0,
  unrealizedPnL: 0,
  marginBalance: 0,
  availableBalance: 0
};

// Mock Chart Data (kept frontend-side for visualization demo)
const CHART_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: 12000 + Math.random() * 1000
}));

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [accountInfo, setAccountInfo] = useState<AccountInfo>(DEFAULT_ACCOUNT);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  // --- API Functions ---
  const API_BASE = 'http://localhost:8000/api';

  const fetchData = async () => {
    try {
      // 1. Fetch Account & Positions
      const accRes = await fetch(`${API_BASE}/account`);
      if (accRes.ok) {
        const accData = await accRes.json();
        setAccountInfo(accData.info);
        setPositions(accData.positions);
      }

      // 2. Fetch Strategies
      const stratRes = await fetch(`${API_BASE}/strategies`);
      if (stratRes.ok) {
        const stratData = await stratRes.json();
        setStrategies(stratData);
      }
    } catch (e) {
      console.error("Failed to connect to backend", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStrategyUpdate = async (updatedStrategy: Strategy) => {
    // Optimistic Update
    setStrategies(prev => prev.map(s => s.id === updatedStrategy.id ? updatedStrategy : s));
    
    // Send to Backend
    try {
      await fetch(`${API_BASE}/strategies`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedStrategy)
      });
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD:
        return (
          <div className="space-y-6 animate-fade-in">
            {loading ? (
                <div className="text-center text-gray-500 py-10">连接后端服务中... (请确保 python server.py 正在运行)</div>
            ) : (
                <>
                <AccountOverview info={accountInfo} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-crypto-card border border-crypto-border rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-4">账户净值曲线 (24H)</h3>
                    <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={CHART_DATA}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#F0B90B" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" vertical={false} />
                        <XAxis dataKey="time" stroke="#848E9C" tick={{fontSize: 12}} />
                        <YAxis stroke="#848E9C" tick={{fontSize: 12}} domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#151A21', border: '1px solid #2B3139', borderRadius: '4px'}}
                            itemStyle={{color: '#F0B90B'}}
                        />
                        <Area type="monotone" dataKey="value" stroke="#F0B90B" fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions / Stats */}
                <div className="bg-crypto-card border border-crypto-border rounded-lg p-4 flex flex-col justify-between">
                    <div>
                    <h3 className="text-lg font-bold text-white mb-4">系统状态</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-crypto-dark p-3 rounded">
                            <span className="text-crypto-muted">运行中策略</span>
                            <span className="font-mono font-bold text-white">
                                {strategies.filter(s => s.status === 'running').length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-crypto-dark p-3 rounded">
                            <span className="text-crypto-muted">API 连接延时</span>
                            <span className="font-mono font-bold text-crypto-green">45ms</span>
                        </div>
                        <div className="flex justify-between items-center bg-crypto-dark p-3 rounded">
                            <span className="text-crypto-muted">最后更新</span>
                            <span className="font-mono text-xs text-white">{new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                    </div>
                    
                    <button 
                    onClick={() => setActiveTab(Tab.STRATEGIES)}
                    className="w-full bg-crypto-yellow text-black font-bold py-3 rounded hover:bg-yellow-500 transition-colors mt-4">
                    管理策略
                    </button>
                </div>
                </div>

                <PositionTable positions={positions} />
                </>
            )}
          </div>
        );
      case Tab.STRATEGIES:
        return (
          // Just showing the first strategy for this demo integration
          strategies.length > 0 ? (
            <StrategyEditor 
                strategy={strategies[0]} 
                onUpdate={handleStrategyUpdate} 
            />
          ) : (
            <div className="text-center py-20">加载策略中...</div>
          )
        );
      case Tab.SETTINGS:
        return (
          <div className="text-center py-20 text-crypto-muted">
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold mb-2">系统设置</h2>
            <p className="mb-4">请在 server.py 环境变量中配置 BINANCE_API_KEY</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-crypto-dark text-crypto-text font-sans">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 border-r border-crypto-border flex flex-col bg-crypto-card flex-shrink-0">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-crypto-border">
          <div className="w-8 h-8 bg-crypto-yellow rounded flex items-center justify-center text-black font-bold mr-0 lg:mr-3">Q</div>
          <span className="hidden lg:block font-bold text-xl text-white">QuantBit</span>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-2">
          <button
            onClick={() => setActiveTab(Tab.DASHBOARD)}
            className={`w-full flex items-center justify-center lg:justify-start px-3 py-3 rounded-lg transition-colors ${activeTab === Tab.DASHBOARD ? 'bg-crypto-border text-white' : 'text-crypto-muted hover:bg-crypto-border hover:text-white'}`}
          >
            <ChartIcon className="w-6 h-6 lg:mr-3" />
            <span className="hidden lg:block font-medium">仪表盘</span>
          </button>
          
          <button
            onClick={() => setActiveTab(Tab.STRATEGIES)}
            className={`w-full flex items-center justify-center lg:justify-start px-3 py-3 rounded-lg transition-colors ${activeTab === Tab.STRATEGIES ? 'bg-crypto-border text-white' : 'text-crypto-muted hover:bg-crypto-border hover:text-white'}`}
          >
            <CodeIcon className="w-6 h-6 lg:mr-3" />
            <span className="hidden lg:block font-medium">量化策略</span>
          </button>

          <button
             onClick={() => setActiveTab(Tab.SETTINGS)}
             className={`w-full flex items-center justify-center lg:justify-start px-3 py-3 rounded-lg transition-colors ${activeTab === Tab.SETTINGS ? 'bg-crypto-border text-white' : 'text-crypto-muted hover:bg-crypto-border hover:text-white'}`}
          >
            <WalletIcon className="w-6 h-6 lg:mr-3" />
             <span className="hidden lg:block font-medium">账户设置</span>
          </button>
        </nav>

        <div className="p-4 border-t border-crypto-border">
          <div className="flex items-center justify-center lg:justify-start">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 mr-0 lg:mr-3"></div>
             <div className="hidden lg:block">
               <div className="text-sm font-bold text-white">Admin User</div>
               <div className="text-xs text-crypto-muted">Pro Plan</div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-crypto-border flex items-center justify-between px-8 bg-crypto-card">
          <h1 className="text-xl font-bold text-white">
            {activeTab === Tab.DASHBOARD && '总览'}
            {activeTab === Tab.STRATEGIES && '策略实验室'}
            {activeTab === Tab.SETTINGS && '设置'}
          </h1>
          <div className="flex items-center space-x-4">
             <span className={`text-xs px-2 py-1 rounded border ${loading ? 'text-red-400 border-red-900 bg-red-900/30' : 'text-crypto-green border-green-900 bg-green-900/30'}`}>
                {loading ? '后端断开' : '系统运行正常'}
             </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8 relative">
           {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;