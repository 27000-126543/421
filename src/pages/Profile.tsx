import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Gem, Heart, Eye, Award, TrendingUp, Trophy, Users, Bell, Check, CheckCheck } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';
import RarityBadge from '@/components/RarityBadge';
import AffixBadge from '@/components/AffixBadge';
import PlayerAvatar from '@/components/PlayerAvatar';
import EnergyBar from '@/components/EnergyBar';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useUIStore } from '@/store/useUIStore';
import { mockDreams } from '../../shared/mockData';
import type { AffixType, Rarity, Notification } from '../../shared/types';

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

export default function Profile() {
  const { currentPlayer, notifications, unreadCount, fetchNotifications, markNotificationRead, markAllNotificationsRead, isLoading } = usePlayerStore();
  const { showToast } = useUIStore();

  const playerId = currentPlayer?.id || 'player-1';
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');

  const player = currentPlayer || {
    id: 'profile-fallback',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=player1',
    nickname: '梦境编织者',
    level: 25,
    exp: 12500,
    experience: 12500,
    maxExperience: 15000,
    coins: 56800,
    dreamFragments: 1250,
    arenaPoints: 0,
    createdAt: new Date().toISOString(),
  };

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications(playerId);
    }
  }, [activeTab, playerId, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(playerId, id);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(playerId);
    showToast({
      type: 'success',
      title: '已全部标记为已读',
      content: '',
    });
  };

  const favorites = mockDreams.slice(0, 6);

  const achievements = [
    { id: '1', name: '初入梦境', icon: '🌙', rarity: 'common' as Rarity, unlocked: true, description: '完成第一次梦境编织' },
    { id: '2', name: '梦境旅人', icon: '✈️', rarity: 'rare' as Rarity, unlocked: true, description: '探索10个不同的梦境' },
    { id: '3', name: '编织大师', icon: '🎨', rarity: 'epic' as Rarity, unlocked: true, description: '创建100个梦境' },
    { id: '4', name: '传说缔造者', icon: '👑', rarity: 'legendary' as Rarity, unlocked: true, description: '创建一个传说级梦境' },
    { id: '5', name: '竞技场王者', icon: '⚔️', rarity: 'epic' as Rarity, unlocked: true, description: '在竞技场中连胜10场' },
    { id: '6', name: '收藏家', icon: '💎', rarity: 'rare' as Rarity, unlocked: true, description: '收藏50个梦境' },
    { id: '7', name: '社交达人', icon: '👥', rarity: 'common' as Rarity, unlocked: true, description: '加入一个公会' },
    { id: '8', name: '梦境富豪', icon: '💰', rarity: 'epic' as Rarity, unlocked: false, description: '累计获得100万金币' },
    { id: '9', name: '完美主义者', icon: '⭐', rarity: 'legendary' as Rarity, unlocked: false, description: '创建一个5星完美梦境' },
  ];

  const stats = [
    { label: '总访客数', value: '12,847', icon: Eye, color: 'text-dream-blue' },
    { label: '总收藏数', value: '3,256', icon: Heart, color: 'text-dream-red' },
    { label: '联赛胜率', value: '62.3%', icon: TrendingUp, color: 'text-dream-green' },
    { label: '公会成员', value: '32', icon: Users, color: 'text-dream-purple' },
  ];

  const expProgress = ((player.experience || player.exp) / (player.maxExperience || player.exp * 2 || 1)) * 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <GlassCard className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative">
              <motion.div
                className="w-28 h-28 rounded-3xl bg-gradient-to-br from-dream-purple to-dream-blue p-1 shadow-lg shadow-dream-purple/30"
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <PlayerAvatar
                  player={player}
                  size="xl"
                  showLevel
                  className="w-full h-full rounded-3xl"
                />
              </motion.div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-dream-green flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                <span className="text-lg">✏️</span>
              </button>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold gradient-text">{player.nickname}</h1>
                <span className="px-3 py-1 rounded-full bg-dream-purple/20 text-dream-purple font-medium">
                  Lv.{player.level}
                </span>
                <RarityBadge rarity="legendary" size="sm" />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-dream-light/60">经验值</span>
                  <span className="text-dream-gold">
                    {(player.experience || player.exp || 0).toLocaleString()} / {(player.maxExperience || (player.exp || 0) * 2 || 0).toLocaleString()}
                  </span>
                </div>
                <EnergyBar
                  current={player.experience || player.exp || 0}
                  max={player.maxExperience || (player.exp || 0) * 2 || 1}
                  color="gold"
                  showLabel={false}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dream-gold/10 border border-dream-gold/30">
                  <Coins className="w-5 h-5 text-dream-gold" />
                  <span className="font-bold text-dream-gold">{player.coins?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dream-purple/10 border border-dream-purple/30">
                  <Gem className="w-5 h-5 text-dream-purple" />
                  <span className="font-bold text-dream-purple">{player.dreamFragments?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <MagicButton size="md" variant="secondary">
                <Award className="w-4 h-4" />
                成就
              </MagicButton>
              <MagicButton size="md">
                编辑资料
              </MagicButton>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex gap-2 bg-dream-purple/10 p-1 rounded-xl inline-flex">
          {[
            { id: 'profile', label: '个人资料', icon: Award },
            { id: 'notifications', label: '消息通知', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-dream-purple to-dream-blue text-white shadow-lg'
                    : 'text-dream-light/60 hover:text-white hover:bg-dream-purple/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-dream-red text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {activeTab === 'profile' && (
        <>
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={i} className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl bg-dream-purple/10 flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-dream-light/60 text-sm">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
            </GlassCard>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-dream-red" />
            梦境收藏
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {favorites.map((dream) => (
              <motion.div
                key={dream.id}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassCard className="p-3 cursor-pointer">
                  <div className="h-20 rounded-xl bg-gradient-to-br from-dream-purple/30 to-dream-blue/30 mb-2 flex items-center justify-center text-2xl overflow-hidden">
                    <img
                      src={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(dream.theme)}&image_size=square`}
                      alt={dream.theme}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-medium text-xs truncate mb-1">{dream.theme}</h4>
                  <div className="flex items-center justify-between">
                    <RarityBadge rarity={dream.rarity || 'rare'} size="sm" showText={false} />
                    <div className="flex items-center gap-1 text-xs text-dream-light/50">
                      <Heart className="w-3 h-3" />
                      {dream.favoritesCount || dream.favoriteCount}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dream.affixes.slice(0, 2).map((affix, i) => (
                      <AffixBadge key={i} affix={affix} size="sm" showText={false} />
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-dream-gold" />
            成就展示
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  achievement.unlocked
                    ? 'bg-dream-purple/10 border-dream-purple/30 hover:border-dream-purple/60'
                    : 'bg-dream-dark/50 border-dream-dark/30 opacity-50'
                }`}
              >
                <div className={`w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-br ${
                  achievement.rarity === 'legendary' ? 'from-dream-gold to-dream-red' :
                  achievement.rarity === 'epic' ? 'from-dream-purple to-dream-blue' :
                  achievement.rarity === 'rare' ? 'from-dream-blue to-dream-green' :
                  'from-gray-500 to-gray-600'
                } flex items-center justify-center text-3xl ${!achievement.unlocked && 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <h4 className="font-medium text-xs text-center truncate mb-1">{achievement.name}</h4>
                <div className="flex justify-center">
                  <RarityBadge rarity={achievement.rarity} size="sm" showText={false} />
                </div>
                {achievement.unlocked && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-dream-green flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-6">统计数据</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-dream-light/60 mb-4">梦境创建</h4>
              <div className="space-y-3">
                {[
                  { label: '总梦境数', value: '128' },
                  { label: '传说级', value: '3' },
                  { label: '史诗级', value: '15' },
                  { label: '稀有级', value: '42' },
                  { label: '普通级', value: '68' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-dream-purple/10 last:border-0">
                    <span className="text-sm text-dream-light/70">{item.label}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-dream-light/60 mb-4">联赛战绩</h4>
              <div className="space-y-3">
                {[
                  { label: '总场次', value: '156' },
                  { label: '胜利', value: '97' },
                  { label: '失败', value: '59' },
                  { label: '最高连胜', value: '12' },
                  { label: '当前段位', value: '钻石 III' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-dream-purple/10 last:border-0">
                    <span className="text-sm text-dream-light/70">{item.label}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-dream-light/60 mb-4">市场交易</h4>
              <div className="space-y-3">
                {[
                  { label: '售出商品', value: '86' },
                  { label: '购入商品', value: '42' },
                  { label: '总收入', value: '256,800' },
                  { label: '总支出', value: '89,500' },
                  { label: '净利润', value: '167,300' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-dream-purple/10 last:border-0">
                    <span className="text-sm text-dream-light/70">{item.label}</span>
                    <span className={`font-bold ${item.label === '净利润' ? 'text-dream-green' : ''}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
        </>
      )}

      {activeTab === 'notifications' && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-dream-gold" />
                消息通知
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-dream-red/20 text-dream-red text-sm font-medium">
                    {unreadCount} 条未读
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <MagicButton size="sm" variant="secondary" onClick={handleMarkAllRead}>
                  <CheckCheck className="w-4 h-4" />
                  全部已读
                </MagicButton>
              )}
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-12 text-dream-light/50">
                  加载中...
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-dream-light/50">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无通知消息</p>
                </div>
              ) : (
                notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:bg-dream-purple/10 ${
                      notification.isRead
                        ? 'bg-dream-purple/5 border-dream-purple/10 opacity-70'
                        : 'bg-dream-purple/10 border-dream-purple/30'
                    }`}
                    onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        notification.type === 'market_announcement' ? 'bg-dream-gold/20 text-dream-gold' :
                        notification.type === 'system' ? 'bg-dream-blue/20 text-dream-blue' :
                        'bg-dream-purple/20 text-dream-purple'
                      }`}>
                        {notification.type === 'market_announcement' ? '📢' :
                         notification.type === 'system' ? '⚙️' : '🔔'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-dream-red flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-dream-light/60 line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-dream-light/40 mt-2">
                          {new Date(notification.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          className="p-1.5 rounded-lg hover:bg-dream-purple/20 text-dream-light/50 hover:text-dream-light flex-shrink-0"
                          title="标记已读"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
