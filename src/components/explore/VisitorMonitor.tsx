import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Brain, Activity, Zap, TrendingUp } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import type { VisitorData } from '../../../shared/types';

interface VisitorMonitorProps {
  visitors: VisitorData[];
}

export default function VisitorMonitor({ visitors }: VisitorMonitorProps) {
  const [emotionData, setEmotionData] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    const generateData = () => {
      const data = [];
      const now = new Date();
      for (let i = 9; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        data.push({
          time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          value: 40 + Math.random() * 40,
        });
      }
      return data;
    };
    setEmotionData(generateData());

    const interval = setInterval(() => {
      setEmotionData((prev) => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          value: 40 + Math.random() * 40,
        });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const avgSubconscious = visitors.length > 0
    ? Math.round(visitors.reduce((sum, v) => sum + v.subconscious, 0) / visitors.length)
    : 0;

  const avgEmotion = visitors.length > 0
    ? Math.round(visitors.reduce((sum, v) => sum + v.emotion, 0) / visitors.length)
    : 0;

  const avgEnergy = visitors.length > 0
    ? Math.round(visitors.reduce((sum, v) => sum + v.energy, 0) / visitors.length)
    : 0;

  const totalEnergy = visitors.reduce((sum, v) => sum + v.energy, 0);

  const renderRingChart = (value: number, maxValue: number, color: string, label: string) => {
    const percentage = (value / maxValue) * 100;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="rgba(155, 93, 229, 0.15)"
              strokeWidth="10"
            />
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 10px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold"
              style={{ color }}
            >
              {value}
            </motion.span>
            <span className="text-xs text-dream-light/50">/ {maxValue}</span>
          </div>
        </div>
        <span className="text-sm text-dream-light/70 mt-2">{label}</span>
      </div>
    );
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-dream-blue" />
        访客监控面板
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {renderRingChart(avgSubconscious, 100, '#9B5DE5', '潜意识值')}
        {renderRingChart(avgEmotion, 100, '#EF476F', '情绪波动')}
        {renderRingChart(avgEnergy, 100, '#4ECDC4', '梦境能量')}
      </div>

      <div className="pt-4 border-t border-dream-purple/20">
        <h4 className="text-sm font-medium text-dream-light/70 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-dream-gold" />
          情绪波动趋势
        </h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={emotionData}>
              <defs>
                <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF476F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF476F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(232, 224, 255, 0.5)', fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(232, 224, 255, 0.5)', fontSize: 10 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(26, 15, 61, 0.95)',
                  border: '1px solid rgba(155, 93, 229, 0.5)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#EF476F"
                strokeWidth={2}
                fill="url(#emotionGradient)"
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-dream-purple/20">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-dream-purple" />
            <span className="text-2xl font-bold text-dream-purple">{visitors.length}</span>
          </div>
          <p className="text-xs text-dream-light/50">当前访客</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-dream-gold" />
            <span className="text-2xl font-bold text-dream-gold">{totalEnergy}</span>
          </div>
          <p className="text-xs text-dream-light/50">总能量</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-dream-green" />
            <span className="text-2xl font-bold text-dream-green">{Math.round(totalEnergy / 60)}</span>
          </div>
          <p className="text-xs text-dream-light/50">能量/分钟</p>
        </div>
      </div>
    </GlassCard>
  );
}
