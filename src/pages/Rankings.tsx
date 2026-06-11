import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, TrendingUp, TrendingDown, Minus, Heart, Coins, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import PlayerAvatar from '@/components/PlayerAvatar';
import { mockPlayers } from '../../shared/mockData';

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

type RankingType = 'favorites' | 'points' | 'contribution';

interface RankingEntry {
  id: string;
  avatar: string;
  nickname: string;
  level: number;
  value: number;
  change: 'up' | 'down' | 'same';
  changeValue: number;
}

export default function Rankings() {
  const [rankingType, setRankingType] = useState<RankingType>('favorites');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const generateRankingData = (type: RankingType): RankingEntry[] => {
    const values = {
      favorites: (i: number) => 5000 - i * 100 + Math.floor(Math.random() * 100),
      points: (i: number) => 2000 - i * 50 + Math.floor(Math.random() * 50),
      contribution: (i: number) => 10000 - i * 300 + Math.floor(Math.random() * 300),
    };

    return mockPlayers.concat(
      Array(30).fill(null).map((_, i) => ({
        id: `player-${i + 20}`,
        nickname: `梦境旅人${i + 1}`,
        avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${i + 20}`,
        level: 5 + Math.floor(Math.random() * 25),
        exp: 0,
        coins: 0,
        dreamFragments: 0,
        arenaPoints: 0,
        createdAt: new Date().toISOString(),
      }))
    ).slice(0, 50).map((player, i) => ({
      id: player.id,
      avatar: player.avatar,
      nickname: player.nickname,
      level: player.level || 10,
      value: values[type](i),
      change: ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'same',
      changeValue: Math.floor(Math.random() * 10 + 1),
    }));
  };

  const rankingData = generateRankingData(rankingType);
  const topThree = rankingData.slice(0, 3);
  const restRanking = rankingData.slice(3);
  const totalPages = Math.ceil(restRanking.length / pageSize);
  const currentData = restRanking.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const tabs = [
    { id: 'favorites', label: '收藏榜', icon: Heart, color: 'text-dream-red' },
    { id: 'points', label: '积分榜', icon: Award, color: 'text-dream-gold' },
    { id: 'contribution', label: '贡献榜', icon: Coins, color: 'text-dream-green' },
  ];

  const getUnitLabel = () => {
    switch (rankingType) {
      case 'favorites': return '收藏';
      case 'points': return '积分';
      case 'contribution': return '贡献';
    }
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const getMedalBg = (rank: number) => {
    switch (rank) {
      case 1: return 'from-dream-gold to-dream-gold/60';
      case 2: return 'from-gray-300 to-gray-400';
      case 3: return 'from-amber-600 to-amber-700';
      default: return 'from-dream-purple to-dream-blue';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold gradient-text mb-2">排行榜</h1>
        <p className="text-dream-light/60">查看各榜单排名情况</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex gap-2 bg-dream-purple/10 p-1 rounded-xl inline-flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setRankingType(tab.id as RankingType);
                  setCurrentPage(1);
                }}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  rankingType === tab.id
                    ? 'bg-gradient-to-r from-dream-purple to-dream-blue text-white shadow-lg'
                    : 'text-dream-light/60 hover:text-white hover:bg-dream-purple/20'
                }`}
              >
                <Icon className={`w-4 h-4 ${rankingType === tab.id ? '' : tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-center items-end gap-8 py-8">
        {[2, 1, 3].map((rank) => {
          const player = topThree[rank - 1];
          if (!player) return null;

          return (
            <motion.div
              key={rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rank * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className={`relative mb-4 ${rank === 1 ? 'scale-125' : ''}`}>
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getMedalBg(rank)} p-1 ${rank === 1 ? 'shadow-lg shadow-dream-gold/50' : ''}`}>
                  <PlayerAvatar
                    player={player}
                    size="xl"
                    className="w-full h-full"
                  />
                </div>
                <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
                  {getMedalEmoji(rank)}
                </div>
                {rank === 1 && (
                  <motion.div
                    className="absolute -top-6 left-1/2 -translate-x-1/2"
                    animate={{ rotate: [-10, 10, -10] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Crown className="w-8 h-8 text-dream-gold" />
                  </motion.div>
                )}
              </div>

              <h4 className="font-bold text-lg mb-1">{player.nickname}</h4>
              <p className="text-sm text-dream-light/50 mb-2">Lv.{player.level}</p>

              <div className={`px-4 py-2 rounded-xl bg-gradient-to-br ${getMedalBg(rank)}`}>
                <p className="text-sm text-white/80">{getUnitLabel()}</p>
                <p className="text-xl font-bold text-white">
                  {player.value.toLocaleString()}
                </p>
              </div>

              <div className={`h-48 w-32 rounded-t-2xl mt-4 bg-gradient-to-t ${getMedalBg(rank)} flex flex-col items-center justify-end pb-4`}>
                <span className="text-3xl font-bold text-white">{rank}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dream-purple/20">
                  <th className="text-left py-3 px-4 text-sm font-medium text-dream-light/50 w-20">排名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dream-light/50">玩家</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dream-light/50">{getUnitLabel()}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dream-light/50 w-24">变化</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((player, i) => {
                  const actualRank = (currentPage - 1) * pageSize + i + 4;
                  return (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-dream-purple/10 hover:bg-dream-purple/10 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          actualRank <= 10
                            ? 'bg-dream-purple/30 text-dream-purple'
                            : 'bg-dream-purple/10 text-dream-light/60'
                        }`}>
                          {actualRank}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar
                            player={player}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium">{player.nickname}</p>
                            <p className="text-xs text-dream-light/50">Lv.{player.level}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-dream-gold">
                          {player.value.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-1 ${
                          player.change === 'up' ? 'text-dream-green' :
                          player.change === 'down' ? 'text-dream-red' :
                          'text-dream-light/50'
                        }`}>
                          {player.change === 'up' && <TrendingUp className="w-4 h-4" />}
                          {player.change === 'down' && <TrendingDown className="w-4 h-4" />}
                          {player.change === 'same' && <Minus className="w-4 h-4" />}
                          {player.change !== 'same' && (
                            <span className="text-sm">{player.changeValue}</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-dream-purple/20">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-dream-purple/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-dream-purple to-dream-blue text-white shadow-lg'
                    : 'hover:bg-dream-purple/20 text-dream-light/60'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-dream-purple/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
