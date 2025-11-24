import React from 'react';
import { Position } from '../types';

interface PositionTableProps {
  positions: Position[];
}

const PositionTable: React.FC<PositionTableProps> = ({ positions }) => {
  return (
    <div className="bg-crypto-card border border-crypto-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-crypto-border flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">当前持仓</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-crypto-text">
          <thead className="bg-crypto-dark text-crypto-muted font-medium">
            <tr>
              <th className="p-4">合约</th>
              <th className="p-4">持仓数量</th>
              <th className="p-4">开仓价格</th>
              <th className="p-4">标记价格</th>
              <th className="p-4">未实现盈亏</th>
              <th className="p-4">模式</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-crypto-border">
            {positions.map((pos) => (
              <tr key={pos.symbol} className="hover:bg-crypto-dark transition-colors">
                <td className="p-4 font-bold">
                  <div className="flex items-center">
                    <span className={`w-1 h-4 rounded mr-2 ${pos.size > 0 ? 'bg-crypto-green' : 'bg-crypto-red'}`}></span>
                    {pos.symbol} 
                    <span className="ml-2 text-xs bg-gray-700 px-1 rounded text-gray-300">{pos.leverage}x</span>
                  </div>
                </td>
                <td className={`p-4 ${pos.size > 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                  {pos.size}
                </td>
                <td className="p-4 text-crypto-text">{pos.entryPrice.toFixed(2)}</td>
                <td className="p-4 text-crypto-text">{pos.markPrice.toFixed(2)}</td>
                <td className="p-4">
                  <div className={pos.pnl >= 0 ? 'text-crypto-green' : 'text-crypto-red'}>
                    {pos.pnl.toFixed(2)} USDT
                  </div>
                  <div className={`text-xs ${pos.pnlPercent >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                    ({pos.pnlPercent.toFixed(2)}%)
                  </div>
                </td>
                <td className="p-4 text-crypto-muted">{pos.marginType}</td>
              </tr>
            ))}
            {positions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-crypto-muted">
                  暂无持仓
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionTable;