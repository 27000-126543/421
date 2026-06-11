import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Hammer, Compass, Swords, ShoppingBag, Users, Eye, Heart } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';
import RarityBadge from '@/components/RarityBadge';
import PlayerAvatar from '@/components/PlayerAvatar';
import { endpoints } from '@/api/endpoints';
import type { Dream } from '../../shared/types';
import { mockDreams, mockPlayers } from '../../shared/mockData';

const quickEntries = [
  { path: '/workshop', label: '梦境工坊', icon: Hammer, color: 'from-purple-500 to-pink-500' },
  { path: '/explore', label: '梦境探索', icon: Compass, color: 'from-cyan-500 to-blue-500' },
  { path: '/arena', label: '联赛大厅', icon: Swords, color: 'from-red-500 to-orange-500' },
  { path: '/market', label: '交易市场', icon: ShoppingBag, color: 'from-green-500 to-emerald-500' },
  { path: '/guild', label: '公会中心', icon: Users, color: 'from-yellow-500 to-amber-500' },
];

const announcements = [
  '🎉 全新梦境主题"星辰之海"现已开放！',
  '⚔️ 周末联赛双倍积分活动进行中',
  '🎁 登录即送100梦之碎片',
  '🏆 第一届编织大师赛即将开始报名',
  '✨ 新功能：梦境词缀系统上线',
];

export default function Home() {
  const navigate = useNavigate();
  const [hotDreams, setHotDreams] = useState<Dream[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dreams = await endpoints.dreams.list({ limit: 6, isPublic: true });
        setHotDreams(dreams.length > 0 ? dreams : mockDreams.slice(0, 6));
      } catch {
        setHotDreams(mockDreams.slice(0, 6));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * 500) + 3500);
    }, 5000);
    setOnlineCount(Math.floor(Math.random() * 500) + 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center py-12">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block"
        >
          <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-4">
            梦境编织
          </h1>
        </motion.div>
        <p className="text-xl text-dream-light/70 mb-2">Dream Weaver System</p>
        <p className="text-dream-light/50 max-w-2xl mx-auto">
          在这里，你将化身为梦境编织师，用潜意识编织出独一无二的梦境世界。
          探索他人的梦境，参与联赛对决，与公会成员共同成长。
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="w-2 h-2 rounded-full bg-dream-green animate-pulse" />
          <span className="text-sm text-dream-green">当前在线 {onlineCount} 人</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard className="py-3 px-6 overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📢</span>
            <div className="flex-1 overflow-hidden relative h-6">
              <motion.div
                key={currentAnnouncement}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                className="absolute inset-0 flex items-center"
              >
                <span className="text-dream-gold font-medium">
                  {announcements[currentAnnouncement]}
                </span>
              </motion.div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-3xl">🚀</span>
          快速入口
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {quickEntries.map((entry) => {
            const Icon = entry.icon;
            return (
              <motion.div
                key={entry.path}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassCard
                  onClick={() => navigate(entry.path)}
                  className="p-6 flex flex-col items-center gap-3 text-center"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${entry.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-medium">{entry.label}</span>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🔥</span>
            热门梦境推荐
          </h2>
          <MagicButton size="sm" variant="secondary" onClick={() => navigate('/explore')}>
            查看更多
          </MagicButton>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="p-6 animate-pulse">
                <div className="h-32 bg-dream-purple/20 rounded-xl mb-4" />
                <div className="h-4 bg-dream-purple/20 rounded w-3/4 mb-2" />
                <div className="h-3 bg-dream-purple/20 rounded w-1/2" />
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotDreams.map((dream) => (
              <motion.div
                key={dream.id}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassCard
                  className="p-6"
                  onClick={() => navigate(`/explore/${dream.id}`)}
                >
                  <div className="h-32 rounded-xl bg-gradient-to-br from-dream-purple/30 to-dream-blue/30 mb-4 flex items-center justify-center relative overflow-hidden">
                    <span className="text-5xl">🌙</span>
                    <div className="absolute top-2 right-2">
                      <RarityBadge
                        rarity={dream.complexity > 80 ? 'legendary' : dream.complexity > 50 ? 'epic' : dream.complexity > 30 ? 'rare' : 'common'}
                        size="sm"
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{dream.name}</h3>
                  <p className="text-sm text-dream-light/50 mb-3 line-clamp-2">
                    {dream.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-dream-light/60">
                        <Eye className="w-4 h-4" />
                        {dream.visitorCount}
                      </span>
                      <span className="flex items-center gap-1 text-dream-light/60">
                        <Heart className="w-4 h-4" />
                        {dream.favoriteCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayerAvatar
                        player={{
                          avatar: mockPlayers.find((p) => p.id === dream.ownerId)?.avatar || '',
                          nickname: '',
                          level: 1,
                        }}
                        size="xs"
                      />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
