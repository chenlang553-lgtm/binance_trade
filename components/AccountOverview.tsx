import React from 'react';
import { AccountInfo } from '../types';
import { WalletIcon } from './Icons';

interface AccountOverviewProps {
  info: AccountInfo;
}

const AccountOverview: React.FC<AccountOverviewProps> = ({ info }) => {
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-crypto-card border border-crypto-border p-5 rounded-lg">
        <div className="flex items-center text-crypto-muted mb-2">
          <WalletIcon className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">总权益 (USDT)</span>
        </div>
        <div className="text-2xl font-bold text-white">{formatMoney(info.totalBalance)}</div>
      </div>

      <div className="bg-crypto-card border border-crypto-border p-5 rounded-lg">
        <div className="text-crypto-muted text-sm font-medium mb-2">未实现盈亏 (PnL)</div>
        <div className={`text-2xl font-bold ${info.unrealizedPnL >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
          {info.unrealizedPnL >= 0 ? '+' : ''}{formatMoney(info.unrealizedPnL)}
        </div>
      </div>

       <div className="bg-crypto-card border border-crypto-border p-5 rounded-lg">
        <div className="text-crypto-muted text-sm font-medium mb-2">保证金余额</div>
        <div className="text-2xl font-bold text-white">{formatMoney(info.marginBalance)}</div>
      </div>

      <div className="bg-crypto-card border border-crypto-border p-5 rounded-lg">
        <div className="text-crypto-muted text-sm font-medium mb-2">可用下单余额</div>
        <div className="text-2xl font-bold text-white">{formatMoney(info.availableBalance)}</div>
      </div>
    </div>
  );
};

export default AccountOverview;