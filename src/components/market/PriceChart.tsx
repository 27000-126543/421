import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '@/components/GlassCard';

interface PriceChartProps {
  data: { date: string; price: number }[];
  suggestedRange?: [number, number];
}

export default function PriceChart({ data, suggestedRange }: PriceChartProps) {
  return (
    <GlassCard className="p-4">
      <h4 className="text-sm font-medium text-dream-light/70 mb-3">7天价格走势</h4>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(232, 224, 255, 0.5)', fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(232, 224, 255, 0.5)', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(26, 15, 61, 0.95)',
                border: '1px solid rgba(155, 93, 229, 0.5)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            {suggestedRange && (
              <>
                <Line
                  type="monotone"
                  dataKey={() => suggestedRange[1]}
                  stroke="rgba(239, 71, 111, 0.3)"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => suggestedRange[0]}
                  stroke="rgba(6, 214, 160, 0.3)"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </>
            )}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#9B5DE5"
              strokeWidth={2}
              dot={{ fill: '#9B5DE5', r: 3 }}
              activeDot={{ fill: '#FFD166', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {suggestedRange && (
        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-dream-purple/20">
          <span className="text-dream-green">建议最低: {suggestedRange[0]}</span>
          <span className="text-dream-red">建议最高: {suggestedRange[1]}</span>
        </div>
      )}
    </GlassCard>
  );
}
