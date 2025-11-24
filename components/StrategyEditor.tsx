import React, { useState, useEffect, useRef } from 'react';
import { Strategy, LogEntry } from '../types';
import { PlayIcon, PauseIcon, SparklesIcon } from './Icons';
import { analyzeStrategy } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface StrategyEditorProps {
  strategy: Strategy;
  onUpdate: (updatedStrategy: Strategy) => void;
}

const StrategyEditor: React.FC<StrategyEditorProps> = ({ strategy, onUpdate }) => {
  const [code, setCode] = useState(strategy.code);
  const [logs, setLogs] = useState<LogEntry[]>(strategy.logs);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Schedule state
  const [startTime, setStartTime] = useState(strategy.startTime || "00:00");
  const [endTime, setEndTime] = useState(strategy.endTime || "23:59");

  // Keep logs in sync with prop updates (polling happens in App.tsx)
  useEffect(() => {
    setLogs(strategy.logs);
  }, [strategy.logs]);

  // Sync status changes
  useEffect(() => {
    setCode(strategy.code);
    setStartTime(strategy.startTime);
    setEndTime(strategy.endTime);
  }, [strategy.id]);

  // Auto scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSave = () => {
    onUpdate({ ...strategy, code, startTime, endTime });
    alert('策略代码已发送至后端保存！');
  };

  const toggleRun = async () => {
    const API_BASE = 'http://localhost:8000/api/strategies';
    if (strategy.status === 'running') {
        try {
            await fetch(`${API_BASE}/${strategy.id}/stop`, { method: 'POST' });
            onUpdate({ ...strategy, status: 'stopped' }); // Optimistic update
        } catch (e) {
            alert("停止失败");
        }
    } else {
        try {
            const res = await fetch(`${API_BASE}/${strategy.id}/start`, { method: 'POST' });
            if (!res.ok) {
                const err = await res.json();
                alert(`启动失败: ${err.detail}`);
                return;
            }
            onUpdate({ ...strategy, status: 'running' }); // Optimistic update
        } catch (e) {
            alert("启动请求失败");
        }
    }
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    const result = await analyzeStrategy(code);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Col: Editor & Controls */}
      <div className="lg:col-span-2 flex flex-col gap-4 h-full">
        {/* Toolbar */}
        <div className="bg-crypto-card border border-crypto-border p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg">{strategy.name}</h2>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${strategy.status === 'running' ? 'bg-crypto-green text-black' : 'bg-gray-600 text-white'}`}>
              {strategy.status === 'running' ? 'RUNNING' : 'STOPPED'}
            </span>
          </div>

          <div className="flex items-center gap-2">
             <div className="flex items-center bg-crypto-dark rounded px-2 py-1 border border-crypto-border">
                <span className="text-xs text-crypto-muted mr-2">运行时间段:</span>
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none w-20" 
                />
                <span className="text-crypto-muted mx-1">-</span>
                <input 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none w-20" 
                />
             </div>
          
            <button
              onClick={handleAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              <SparklesIcon className="w-4 h-4" />
              {isAnalyzing ? '分析中...' : 'AI 分析'}
            </button>
            
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-crypto-border hover:bg-gray-600 rounded text-sm font-medium transition-colors"
            >
              保存代码
            </button>

            <button
              onClick={toggleRun}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold transition-colors ${
                strategy.status === 'running' 
                  ? 'bg-crypto-red hover:bg-red-700 text-white' 
                  : 'bg-crypto-green hover:bg-green-600 text-black'
              }`}
            >
              {strategy.status === 'running' ? <><PauseIcon className="w-4 h-4" /> 停止</> : <><PlayIcon className="w-4 h-4" /> 运行</>}
            </button>
          </div>
        </div>

        {/* Code Editor Area */}
        <div className="flex-1 bg-crypto-dark border border-crypto-border rounded-lg p-2 relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-transparent text-crypto-text font-mono text-sm p-4 focus:outline-none resize-none custom-scrollbar leading-6"
            spellCheck={false}
          />
          <div className="absolute bottom-2 right-4 text-xs text-crypto-muted">Python 3.10 Execution Environment</div>
        </div>
      </div>

      {/* Right Col: Logs & AI Output */}
      <div className="flex flex-col gap-4 h-full">
        {/* Logs */}
        <div className="flex-1 bg-black border border-crypto-border rounded-lg overflow-hidden flex flex-col">
          <div className="bg-crypto-card px-4 py-2 border-b border-crypto-border text-sm font-medium text-crypto-muted">
            运行日志 (Live Terminal)
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs custom-scrollbar">
            {logs.length === 0 && <span className="text-gray-600">等待脚本启动...</span>}
            {logs.map((log, idx) => (
              <div key={log.id || idx} className="mb-1">
                <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                <span className={`${
                  log.level === 'ERROR' ? 'text-crypto-red' :
                  log.level === 'TRADE' ? 'text-crypto-green' :
                  log.level === 'WARNING' ? 'text-crypto-yellow' : 'text-blue-400'
                }`}>
                  {log.level}
                </span>:{' '}
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* AI Analysis Result Panel */}
        {analysisResult && (
          <div className="h-1/3 bg-crypto-card border border-crypto-border rounded-lg flex flex-col overflow-hidden">
             <div className="bg-indigo-900/30 px-4 py-2 border-b border-crypto-border text-sm font-medium text-indigo-300 flex justify-between">
                <span>AI 代码审计报告</span>
                <button onClick={() => setAnalysisResult(null)} className="hover:text-white">✕</button>
             </div>
             <div className="p-4 overflow-y-auto custom-scrollbar text-sm prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{analysisResult}</ReactMarkdown>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyEditor;