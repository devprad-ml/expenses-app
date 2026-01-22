'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS: Record<string, string> = {
  food: '#f97316', // Orange
  rent: '#3b82f6', // Blue
  transport: '#a855f7', // Purple
  entertainment: '#ec4899', // Pink
  utilities: '#eab308', // Yellow
  health: '#ef4444', // Red
  other: '#64748b', // Slate
};

export default function SpendingChart({ expenses }: { expenses: any[] }) {
  
  // 1. Aggregate Data: Sum up amounts by category
  const dataMap = expenses.reduce((acc: any, curr: any) => {
    const category = curr.category || 'other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += curr.amount;
    return acc;
  }, {});

  // 2. Format for Recharts
  const data = Object.keys(dataMap).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize
    value: dataMap[key],
    color: COLORS[key] || COLORS.other
  })).filter(item => item.value > 0); // Hide empty categories

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm border border-slate-800 rounded-2xl border-dashed">
        No data to display
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-slate-400 text-sm font-medium mb-4">Spending Breakdown</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number | undefined) => {if (value === undefined) return ''; `$${value.toFixed(2)}`}}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}