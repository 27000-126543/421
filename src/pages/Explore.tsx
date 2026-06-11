import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Compass, Users, Clock, Eye, Heart, AlertTriangle } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';
import RarityBadge from '@/components/RarityBadge';
import AffixBadge from '@/components/AffixBadge';
import PlayerAvatar from '@/components/PlayerAvatar';
import VisitorMonitor from '@/components/explore/VisitorMonitor';
import EventModal from '@/components/explore/EventModal';
import EnergyBar from '@/components/EnergyBar';
import { useDreamStore } from '@/store/useDreamStore';
import { useUIStore } from '@/store/useUIStore';
import type { Dream, VisitorData, RandomEvent } from '../../shared/types';
import { mockDreams, mockPlayers } from '../../shared/mockData';

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

export default function Explore() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dreams, currentDream, setCurrentDream, visitors, setVisitors, randomEvents, setRandomEvents } = useDreamStore();
  const { showToast } = useUIStore();

  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [currentVisitors, setCurrentVisitors] = useState<VisitorData[]>([]);
  const [activeEvent, setActiveEvent] = useState<RandomEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (id) {
        const dream = mockDreams.find((d) => d.id === id) || mockDreams[0];
        setSelectedDream(dream);
        setCurrentDream(dream);

        const mockVisitors: VisitorData[] = Array(5).fill(null).map((_, i) => {
          const player = mockPlayers[i % mockPlayers.length];
          return {
            id: `visitor-${i}`,
            playerId: player.id,
            dreamId: dream.id,
            playerName: player.nickname,
            playerAvatar: player.avatar,
            subconscious: Math.floor(Math.random() * 60) + 30,
            emotion: Math.floor(Math.random() * 60) + 30,
            energy: Math.floor(Math.random() * 60) + 30,
            enterTime: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
          };
        });
        setCurrentVisitors(mockVisitors);
        setVisitors(mockVisitors);

        const mockEvents: RandomEvent[] = [
          {
            id: 'event-1',
            dreamId: dream.id,
            type: 'nightmare',
            status: 'pending',
            description: '一只梦魇巨兽正在侵入梦境，威胁着访客的安全！需要立即采取行动。',
            triggeredAt: new Date().toISOString(),
          },
        ];
        setRandomEvents(mockEvents);
      } else {
        setSelectedDream(null);
      }
      setIsLoading(false);
    };
    loadData();
  }, [id]);

  useEffect(() => {
    if (randomEvents.length > 0 && !showEventModal) {
      const pendingEvent = randomEvents.find((e) => e.status === 'pending');
      if (pendingEvent) {
        setActiveEvent(pendingEvent);
        setShowEventModal(true);
      }
    }
  }, [randomEvents]);

  const formatEnterTime = (time: string) => {
    const diff = Date.now() - new Date(time).getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes > 0 ? `${minutes}分钟前` : '刚刚进入';
  };

  const handleDispatchGuardian = () => {
    if (activeEvent) {
      const coins = Math.floor(Math.random() * 500) + 100;
      const fragments = Math.floor(Math.random() * 20) + 5;
      showToast({
        type: activeEvent.type === 'nightmare' ? 'success' : 'info',
        title: activeEvent.type === 'nightmare' ? '守护者已派遣！' : '记忆碎片已收集！',
        content: `获得 ${coins} 金币，${fragments} 梦之碎片`,
      });
    }
  };

  const handleAdjustScene = () => {
    showToast({
      type: 'info',
      title: '场景已调整',
      content: '梦境稳定性已恢复',
    });
  };

  const allDreams = dreams.length > 0 ? dreams : mockDreams;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-dream-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">梦境探索</h1>
          <p className="text-dream-light/60">探索他人的梦境，监控访客，处理随机事件</p>
        </div>
        {id && (
          <MagicButton variant="secondary" onClick={() => navigate('/explore')}>
            返回列表
          </MagicButton>
        )}
      </motion.div>

      {!selectedDream ? (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allDreams.filter((d) => d.isPublic).map((dream) => (
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
                <div className="flex flex-wrap gap-1 mb-3">
                  {dream.affixes.slice(0, 3).map((affix) => (
                    <AffixBadge key={affix} affix={affix} size="sm" />
                  ))}
                </div>
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
                  <span className="text-dream-light/50">
                    {mockPlayers.find((p) => p.id === dream.ownerId)?.nickname}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-48 rounded-2xl bg-gradient-to-br from-dream-purple/40 to-dream-blue/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-7xl">🌙</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{selectedDream.name}</h2>
                      <p className="text-dream-light/60 mb-2">{selectedDream.theme}</p>
                      <div className="flex items-center gap-3">
                        <RarityBadge
                          rarity={selectedDream.complexity > 80 ? 'legendary' : selectedDream.complexity > 50 ? 'epic' : selectedDream.complexity > 30 ? 'rare' : 'common'}
                        />
                        <span className="text-sm text-dream-light/50">
                          by {mockPlayers.find((p) => p.id === selectedDream.ownerId)?.nickname}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MagicButton size="sm" variant="secondary">
                        <Heart className="w-4 h-4" />
                        收藏
                      </MagicButton>
                    </div>
                  </div>
                  <p className="text-dream-light/70 mb-4">{selectedDream.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedDream.affixes.map((affix) => (
                      <AffixBadge key={affix} affix={affix} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-dream-purple/20">
                    <div>
                      <p className="text-xs text-dream-light/50 mb-1">稳定性</p>
                      <EnergyBar
                        current={selectedDream.stability}
                        max={100}
                        color={selectedDream.stability >= 70 ? 'green' : selectedDream.stability >= 40 ? 'gold' : 'red'}
                        size="md"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-dream-light/50 mb-1">经验评分</p>
                      <p className="text-xl font-bold text-dream-gold">{selectedDream.experienceScore}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dream-light/50 mb-1">复杂度</p>
                      <p className="text-xl font-bold text-dream-purple">{selectedDream.complexity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dream-light/50 mb-1">访客数</p>
                      <p className="text-xl font-bold text-dream-blue">{selectedDream.visitorCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <VisitorMonitor visitors={currentVisitors} />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              {randomEvents.length > 0 && (
                <GlassCard
                  className="p-4 cursor-pointer hover:ring-2 hover:ring-dream-red/50 transition-all"
                  onClick={() => {
                    const pending = randomEvents.find((e) => e.status === 'pending');
                    if (pending) {
                      setActiveEvent(pending);
                      setShowEventModal(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-dream-red/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-dream-red animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-dream-red">待处理事件</p>
                      <p className="text-xs text-dream-light/60">
                        {randomEvents.filter((e) => e.status === 'pending').length} 个事件需要处理
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )}

              <GlassCard className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-dream-green" />
                  当前访客 ({currentVisitors.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {currentVisitors.map((visitor) => (
                      <motion.div
                        key={visitor.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-dream-purple/10 hover:bg-dream-purple/20 transition-colors"
                      >
                        <PlayerAvatar
                          player={{
                            avatar: visitor.playerAvatar,
                            nickname: visitor.playerName,
                            level: 1,
                          }}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{visitor.playerName}</p>
                          <div className="flex items-center gap-3 text-xs text-dream-light/50">
                            <span className="flex items-center gap-1">
                              <Compass className="w-3 h-3" />
                              {visitor.subconscious}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {visitor.energy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatEnterTime(visitor.enterTime)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}

      <EventModal
        isOpen={showEventModal}
        event={activeEvent}
        onClose={() => setShowEventModal(false)}
        onDispatchGuardian={handleDispatchGuardian}
        onAdjustScene={handleAdjustScene}
      />
    </motion.div>
  );
}
