import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, Users, Clock, ChevronDown, TrendingUp, TrendingDown, Gift, RefreshCw } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';
import PlayerAvatar from '@/components/PlayerAvatar';
import RarityBadge from '@/components/RarityBadge';
import { useArenaStore } from '@/store/useArenaStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useUIStore } from '@/store/useUIStore';
import type { Dream, Battle } from '../../shared/types';
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

export default function Arena() {
  const navigate = useNavigate();
  const { currentPlayer } = usePlayerStore();
  const { isMatching, startMatching, stopMatching, checkMatchStatus, matchHistory, matchResult, isLoading, error, setError } = useArenaStore();
  const { showToast } = useUIStore();

  const playerId = currentPlayer?.id || 'player-1';
  const [selectedDreamId, setSelectedDreamId] = useState<string>('');
  const [showDreamDropdown, setShowDreamDropdown] = useState(false);
  const [queueCount, setQueueCount] = useState(128);
  const [activeTab, setActiveTab] = useState<'matching' | 'history' | 'rewards'>('matching');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const myDreams = mockDreams.filter((d) => d.ownerId === 'player-1');
  const selectedDream = myDreams.find((d) => d.id === selectedDreamId) || myDreams[0];

  useEffect(() => {
    if (myDreams.length > 0 && !selectedDreamId) {
      setSelectedDreamId(myDreams[0].id);
    }
  }, [myDreams]);

  useEffect(() => {
    if (isMatching) {
      const interval = setInterval(() => {
        setQueueCount(Math.floor(Math.random() * 100) + 80);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isMatching]);

  useEffect(() => {
    if (isMatching) {
      pollingRef.current = setInterval(async () => {
        const result = await checkMatchStatus();
        if (result?.status === 'success' && result.battleId) {
          showToast({
            type: 'success',
            title: '匹配成功！',
            content: `已为你找到对手：${result.matchedPlayer?.name}`,
          });
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          navigate(`/battle/${result.battleId}`);
        } else if (result?.status === 'timeout') {
          showToast({
            type: 'warning',
            title: '匹配超时',
            content: '暂无合适对手，请稍后再试',
          });
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      }, 2000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isMatching, checkMatchStatus, navigate, showToast]);

  const handleMatch = async () => {
    if (!selectedDreamId) return;

    if (isMatching) {
      await stopMatching();
      showToast({
        type: 'info',
        title: '已取消匹配',
        content: '',
      });
    } else {
      const matched = await startMatching(playerId, selectedDreamId);
      if (matched && matchResult?.battleId) {
        showToast({
          type: 'success',
          title: '匹配成功！',
          content: `已为你找到对手`,
        });
        navigate(`/battle/${matchResult.battleId}`);
      } else if (error) {
        showToast({
          type: 'error',
          title: '匹配失败',
          content: error,
        });
      }
    }
  };

  const handleRefreshStatus = async () => {
    const result = await checkMatchStatus();
    if (result?.status === 'success' && result.battleId) {
      showToast({
        type: 'success',
        title: '匹配成功！',
        content: `已为你找到对手`,
      });
      navigate(`/battle/${result.battleId}`);
    }
  };

  const mockHistory: Battle[] = [
    {
      id: 'battle-1',
      player1Id: 'player-1',
      player2Id: 'player-2',
      player1Name: currentPlayer?.nickname || '梦境旅人',
      player2Name: '星辰编织者',
      player1Avatar: currentPlayer?.avatar || '',
      player2Avatar: mockPlayers[1].avatar,
      player1DreamId: 'dream-1',
      player2DreamId: 'dream-2',
      player1DreamName: '记忆花园·秘境',
      player2DreamName: '恐惧深渊·幻境',
      player1Energy: 80,
      player2Energy: 45,
      player1MaxEnergy: 100,
      player2MaxEnergy: 100,
      player1Skills: [],
      player2Skills: [],
      status: 'finished',
      winnerId: 'player-1',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      duration: 180,
      battleLog: [],
    },
    {
      id: 'battle-2',
      player1Id: 'player-1',
      player2Id: 'player-3',
      player1Name: currentPlayer?.nickname || '梦境旅人',
      player2Name: '深渊漫步者',
      player1Avatar: currentPlayer?.avatar || '',
      player2Avatar: mockPlayers[2].avatar,
      player1DreamId: 'dream-1',
      player2DreamId: 'dream-3',
      player1DreamName: '记忆花园·秘境',
      player2DreamName: '星辰之海·梦境',
      player1Energy: 30,
      player2Energy: 90,
      player1MaxEnergy: 100,
      player2MaxEnergy: 100,
      player1Skills: [],
      player2Skills: [],
      status: 'finished',
      winnerId: 'player-3',
      startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      duration: 210,
      battleLog: [],
    },
    {
      id: 'battle-3',
      player1Id: 'player-1',
      player2Id: 'player-4',
      player1Name: currentPlayer?.nickname || '梦境旅人',
      player2Name: '时光守护者',
      player1Avatar: currentPlayer?.avatar || '',
      player2Avatar: mockPlayers[3].avatar,
      player1DreamId: 'dream-1',
      player2DreamId: 'dream-4',
      player1DreamName: '记忆花园·秘境',
      player2DreamName: '时光回廊·奇境',
      player1Energy: 100,
      player2Energy: 20,
      player1MaxEnergy: 100,
      player2MaxEnergy: 100,
      player1Skills: [],
      player2Skills: [],
      status: 'finished',
      winnerId: 'player-1',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      duration: 150,
      battleLog: [],
    },
  ];

  const rewards = [
    { name: '青铜段位奖励', icon: '🥉', coins: 500, fragments: 20, required: 1000 },
    { name: '白银段位奖励', icon: '🥈', coins: 1000, fragments: 50, required: 1500 },
    { name: '黄金段位奖励', icon: '🥇', coins: 2000, fragments: 100, required: 2000 },
    { name: '传奇段位奖励', icon: '👑', coins: 5000, fragments: 300, required: 2500 },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">联赛大厅</h1>
          <p className="text-dream-light/60">参与梦境对决，赢取丰厚奖励</p>
        </div>
        <MagicButton variant="secondary" onClick={() => navigate('/rankings')}>
          <Trophy className="w-4 h-4" />
          排行榜
        </MagicButton>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex gap-2 bg-dream-purple/10 p-1 rounded-xl inline-flex">
          {[
            { id: 'matching', label: '匹配大厅', icon: Swords },
            { id: 'history', label: '战绩记录', icon: Clock },
            { id: 'rewards', label: '奖励展示', icon: Gift },
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
              </button>
            );
          })}
        </div>
      </motion.div>

      {activeTab === 'matching' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Swords className="w-5 h-5 text-dream-red" />
              匹配大厅
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-dream-light/70 mb-2">
                选择参赛梦境
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowDreamDropdown(!showDreamDropdown)}
                  className="w-full px-4 py-3 rounded-xl bg-dream-purple/10 border border-dream-purple/30 flex items-center justify-between hover:border-dream-purple/60 transition-colors"
                >
                  {selectedDream ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌙</span>
                      <div className="text-left">
                        <p className="font-medium">{selectedDream.name}</p>
                        <div className="flex items-center gap-2">
                          <RarityBadge
                            rarity={selectedDream.complexity > 80 ? 'legendary' : selectedDream.complexity > 50 ? 'epic' : selectedDream.complexity > 30 ? 'rare' : 'common'}
                            size="sm"
                          />
                          <span className="text-xs text-dream-light/50">
                            稳定: {selectedDream.stability}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-dream-light/50">请选择梦境</span>
                  )}
                  <ChevronDown className={`w-5 h-5 transition-transform ${showDreamDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDreamDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-dream-dark/95 backdrop-blur-lg border border-dream-purple/30 rounded-xl overflow-hidden z-50">
                    {myDreams.map((dream) => (
                      <button
                        key={dream.id}
                        onClick={() => {
                          setSelectedDreamId(dream.id);
                          setShowDreamDropdown(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-dream-purple/20 transition-colors ${
                          selectedDreamId === dream.id ? 'bg-dream-purple/20' : ''
                        }`}
                      >
                        <span className="text-2xl">🌙</span>
                        <div className="text-left flex-1">
                          <p className="font-medium">{dream.name}</p>
                          <p className="text-xs text-dream-light/50">稳定: {dream.stability}</p>
                        </div>
                        <RarityBadge
                          rarity={dream.complexity > 80 ? 'legendary' : dream.complexity > 50 ? 'epic' : dream.complexity > 30 ? 'rare' : 'common'}
                          size="sm"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center py-8">
              {isMatching ? (
                <div className="space-y-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-24 h-24 mx-auto rounded-full border-4 border-dashed border-dream-purple flex items-center justify-center"
                  >
                    <Swords className="w-10 h-10 text-dream-purple" />
                  </motion.div>
                  <p className="text-xl font-bold">正在匹配中...</p>
                  <p className="text-sm text-dream-light/50">
                    匹配编号: <span className="text-dream-gold font-mono">{matchResult?.matchId || '-'}</span>
                  </p>
                  <p className="text-dream-light/60">
                    当前队列: <span className="text-dream-gold font-bold">{queueCount}</span> 人
                  </p>
                  <p className="text-sm text-dream-light/50">
                    预计等待时间: {matchResult?.estimatedWaitTime || 60}秒
                  </p>
                  <div className="flex gap-3 justify-center">
                    <MagicButton variant="secondary" onClick={handleRefreshStatus} disabled={isLoading}>
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      刷新状态
                    </MagicButton>
                    <MagicButton variant="danger" onClick={handleMatch}>
                      取消匹配
                    </MagicButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-dream-purple/20 to-dream-blue/20 flex items-center justify-center">
                    <Users className="w-10 h-10 text-dream-blue" />
                  </div>
                  <p className="text-dream-light/60">
                    当前队列: <span className="text-dream-gold font-bold">{queueCount}</span> 人
                  </p>
                  <MagicButton
                    size="lg"
                    onClick={handleMatch}
                    disabled={!selectedDreamId || isLoading}
                    glow
                  >
                    <Swords className="w-5 h-5" />
                    {isLoading ? '匹配中...' : '快速匹配'}
                  </MagicButton>
                </div>
              )}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-dream-gold" />
                当前积分
              </h3>
              <div className="text-center">
                <p className="text-5xl font-bold gradient-text mb-2">
                  {currentPlayer?.arenaPoints || 1520}
                </p>
                <p className="text-dream-light/60">
                  段位: <span className="text-dream-gold font-medium">黄金 III</span>
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-dream-green" />
                近期战绩
              </h3>
              <div className="space-y-3">
                {mockHistory.slice(0, 3).map((battle) => {
                  const isWinner = battle.winnerId === 'player-1';
                  return (
                    <div
                      key={battle.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-dream-purple/10"
                    >
                      <div className="flex items-center gap-3">
                        <PlayerAvatar
                          player={{
                            avatar: battle.player2Avatar,
                            nickname: battle.player2Name,
                            level: 1,
                          }}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-sm">{battle.player2Name}</p>
                          <p className="text-xs text-dream-light/50">
                            {Math.floor((Date.now() - new Date(battle.startTime).getTime()) / 3600000)}小时前
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isWinner ? (
                          <span className="flex items-center gap-1 text-dream-green text-sm">
                            <TrendingUp className="w-4 h-4" />
                            +15
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-dream-red text-sm">
                            <TrendingDown className="w-4 h-4" />
                            -10
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}

      {activeTab === 'history' && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-dream-blue" />
              战绩记录
            </h3>
            <div className="space-y-4">
              {mockHistory.map((battle) => {
                const isWinner = battle.winnerId === 'player-1';
                return (
                  <motion.div
                    key={battle.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-xl bg-dream-purple/10 border border-dream-purple/20 hover:border-dream-purple/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <PlayerAvatar
                            player={{
                              avatar: battle.player1Avatar,
                              nickname: battle.player1Name,
                              level: 1,
                            }}
                            size="md"
                          />
                          <div>
                            <p className="font-medium">{battle.player1Name}</p>
                            <p className="text-xs text-dream-light/50">{battle.player1DreamName}</p>
                          </div>
                        </div>

                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                          isWinner
                            ? 'bg-dream-green/20 text-dream-green border border-dream-green/30'
                            : 'bg-dream-red/20 text-dream-red border border-dream-red/30'
                        }`}>
                          {isWinner ? '胜利' : '失败'}
                        </div>

                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-right">{battle.player2Name}</p>
                            <p className="text-xs text-dream-light/50 text-right">{battle.player2DreamName}</p>
                          </div>
                          <PlayerAvatar
                            player={{
                              avatar: battle.player2Avatar,
                              nickname: battle.player2Name,
                              level: 1,
                            }}
                            size="md"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-dream-light/50">
                            时长: {Math.floor(battle.duration / 60)}分{battle.duration % 60}秒
                          </span>
                          <span className="text-dream-light/50">
                            {new Date(battle.startTime).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isWinner ? (
                            <span className="flex items-center gap-1 text-dream-green">
                              <TrendingUp className="w-4 h-4" />
                              +15 积分
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-dream-red">
                              <TrendingDown className="w-4 h-4" />
                              -10 积分
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === 'rewards' && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Gift className="w-5 h-5 text-dream-gold" />
              赛季奖励
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rewards.map((reward, index) => {
                const isUnlocked = (currentPlayer?.arenaPoints || 1520) >= reward.required;
                return (
                  <GlassCard
                    key={index}
                    className={`p-4 text-center ${isUnlocked ? '' : 'opacity-50'}`}
                  >
                    <span className="text-4xl mb-3 block">{reward.icon}</span>
                    <h4 className="font-bold mb-2">{reward.name}</h4>
                    <div className="space-y-1 mb-4">
                      <p className="text-sm text-dream-gold">💰 {reward.coins} 金币</p>
                      <p className="text-sm text-dream-blue">💎 {reward.fragments} 碎片</p>
                    </div>
                    <p className="text-xs text-dream-light/50">
                      需要 {reward.required} 积分
                    </p>
                    {isUnlocked && (
                      <MagicButton size="sm" className="w-full mt-3">
                        领取
                      </MagicButton>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
