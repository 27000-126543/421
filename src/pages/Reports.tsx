import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid, Bar, Legend, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, FileText } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useUIStore } from '@/store/useUIStore';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Reports() {
  const { showToast } = useUIStore();

  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');
  const [isExporting, setIsExporting] = useState(false);

  const heatmapData = Array(7).fill(null).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return {
      day: d.toLocaleDateString('zh-CN', { weekday: 'short' }),
      plants: Math.floor(Math.random() * 80 + 20),
      buildings: Math.floor(Math.random() * 80 + 20),
      creatures: Math.floor(Math.random() * 80 + 20),
      weather: Math.floor(Math.random() * 80 + 20),
    };
  });

  const stabilityData = Array(30).fill(null).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 29 + i);
    return {
      date: d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      稳定性: Math.floor(Math.random() * 30 + 60),
      平均: 75,
    };
  });

  const priceData = Array(30).fill(null).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 29 + i);
    return {
      date: d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      蓝图价格: Math.floor(Math.random() * 500 + 200),
      契约价格: Math.floor(Math.random() * 1000 + 500),
    };
  });

  const energyData = [
    { subject: '创造力', A: 85, fullMark: 100 },
    { subject: '稳定性', A: 92, fullMark: 100 },
    { subject: '吸引力', A: 78, fullMark: 100 },
    { subject: '探索度', A: 70, fullMark: 100 },
    { subject: '情感共鸣', A: 88, fullMark: 100 },
    { subject: '独特性', A: 95, fullMark: 100 },
  ];

  const COLORS = ['#9B5DE5', '#00BBF9', '#00F5D4', '#FEE440', '#F15BB5'];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('report-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: '#0F0A1F',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('梦境数据报告.pdf');

      showToast({
        type: 'success',
        title: '导出成功',
        content: '报告已成功导出为PDF文件',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: '导出失败',
        content: '请稍后重试',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getRangeLabel = () => {
    const now = new Date();
    const start = new Date();
    if (dateRange === 'week') {
      start.setDate(now.getDate() - 6);
    } else if (dateRange === 'month') {
      start.setMonth(now.getMonth() - 1);
    } else {
      start.setFullYear(now.getFullYear() - 1);
    }
    return `${start.toLocaleDateString('zh-CN')} - ${now.toLocaleDateString('zh-CN')}`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">数据报告</h1>
          <p className="text-dream-light/60">{getRangeLabel()}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-dream-purple/10 p-1 rounded-xl">
            {[
              { id: 'week', label: '本周' },
              { id: 'month', label: '本月' },
              { id: 'year', label: '全年' },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setDateRange(range.id as typeof dateRange)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  dateRange === range.id
                    ? 'bg-gradient-to-r from-dream-purple to-dream-blue text-white shadow-lg'
                    : 'text-dream-light/60 hover:text-white hover:bg-dream-purple/20'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {range.label}
              </button>
            ))}
          </div>

          <MagicButton onClick={handleExportPDF} disabled={isExporting}>
            <Download className="w-4 h-4" />
            {isExporting ? '导出中...' : '导出PDF'}
          </MagicButton>
        </div>
      </motion.div>

      <div id="report-content" className="space-y-6">
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '总访客数', value: '12,847', change: '+12.5%', icon: '👥' },
            { label: '平均稳定性', value: '82.3%', change: '+3.2%', icon: '⚡' },
            { label: '总收藏数', value: '3,256', change: '+8.7%', icon: '❤️' },
            { label: '总收入', value: '156,800', change: '+15.3%', icon: '💰' },
          ].map((stat, i) => (
            <GlassCard key={i} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{stat.icon}</span>
                <span className="flex items-center gap-1 text-dream-green text-sm font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <h4 className="text-2xl font-bold gradient-text">{stat.value}</h4>
              <p className="text-dream-light/50 text-sm">{stat.label}</p>
            </GlassCard>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-dream-purple" />
              场景热度热力图
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(155, 93, 229, 0.2)" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(232, 224, 255, 0.7)', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(232, 224, 255, 0.7)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(26, 15, 61, 0.95)',
                      border: '1px solid rgba(155, 93, 229, 0.5)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="plants" name="植物" radius={[4, 4, 0, 0]}>
                    {heatmapData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[0]} />
                    ))}
                  </Bar>
                  <Bar dataKey="buildings" name="建筑" radius={[4, 4, 0, 0]}>
                    {heatmapData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[1]} />
                    ))}
                  </Bar>
                  <Bar dataKey="creatures" name="生物" radius={[4, 4, 0, 0]}>
                    {heatmapData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[2]} />
                    ))}
                  </Bar>
                  <Bar dataKey="weather" name="天气" radius={[4, 4, 0, 0]}>
                    {heatmapData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[3]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-dream-blue" />
              稳定性曲线图
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stabilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(155, 93, 229, 0.2)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(232, 224, 255, 0.5)', fontSize: 10 }}
                    interval={4}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(232, 224, 255, 0.5)', fontSize: 10 }}
                    domain={[50, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(26, 15, 61, 0.95)',
                      border: '1px solid rgba(155, 93, 229, 0.5)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="稳定性"
                    stroke="#9B5DE5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#FFD166' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="平均"
                    stroke="rgba(255, 209, 102, 0.5)"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-dream-gold" />
              交易价格走势图
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(155, 93, 229, 0.2)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(232, 224, 255, 0.5)', fontSize: 10 }}
                    interval={4}
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
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="蓝图价格"
                    stroke="#00BBF9"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#00BBF9' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="契约价格"
                    stroke="#F15BB5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#F15BB5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-dream-green" />
              梦境能量雷达图
            </h3>
            <div className="flex items-center justify-center">
              <div className="h-80 w-full max-w-md">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={energyData}>
                    <PolarGrid stroke="rgba(155, 93, 229, 0.3)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: 'rgba(232, 224, 255, 0.8)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: 'rgba(232, 224, 255, 0.5)', fontSize: 10 }}
                    />
                    <Radar
                      name="能量值"
                      dataKey="A"
                      stroke="#9B5DE5"
                      fill="#9B5DE5"
                      fillOpacity={0.5}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(26, 15, 61, 0.95)',
                        border: '1px solid rgba(155, 93, 229, 0.5)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
