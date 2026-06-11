import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Users, Coins, Gift, Settings, Calendar, TrendingUp, Plus } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';
import PlayerAvatar from '@/components/PlayerAvatar';
import BuildingCard from '@/components/guild/BuildingCard';
import { useGuildStore } from '@/store/useGuildStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useUIStore } from '@/store/useUIStore';
import { mockGuilds, mockPlayers } from '../../shared/mockData';

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

export default function Guild() {
  const { currentPlayer, updatePlayer } = usePlayerStore();
  const { currentGuild, upgradeBuilding, updateMember, fetchMyGuild, isLoading, error } = useGuildStore();
  const { showToast } = useUIStore();

  const playerId = currentPlayer?.id || 'player-1';
  const [activeTab, setActiveTab] = useState<'info' | 'buildings' | 'members' | 'contribute'>('info');
  const [materialContribution, setMaterialContribution] = useState(0);
  const [coinContribution, setCoinContribution] = useState(0);
  const [selectedBuilding, setSelectedBuilding] = useState<'dream_tower' | 'research_hall'>('dream_tower');

  const guild = currentGuild || mockGuilds[0];

  const handleUpgrade = (buildingName: string) => {
    showToast({
      type: 'success',
      title: '升级成功',
      content: `${buildingName} 已成功升级！`,
    });
  };

  const handleContribute = async () => {
    if (materialContribution <= 0 || coinContribution <= 0) {
      showToast({
        type: 'error',
        title: '请输入贡献数量',
        content: '材料和金币都必须填写才能贡献',
      });
      return;
    }

    if (!currentGuild?.id) {
      showToast({
        type: 'error',
        title: '未加入公会',
        content: '',
      });
      return;
    }

    try {
      const result = await upgradeBuilding(selectedBuilding, {
        guildId: currentGuild.id,
        playerId,
        materials: materialContribution,
        coins: coinContribution,
      });

      if (result) {
        showToast({
          type: 'success',
          title: '贡献成功',
          content: `贡献了 ${materialContribution} 材料和 ${coinContribution} 金币，获得 ${result.contributionGained} 贡献值`,
        });

        if (result.remainingMaterials !== undefined) {
          updatePlayer({ materials: result.remainingMaterials });
        }
        if (result.remainingCoins !== undefined) {
          updatePlayer({ coins: result.remainingCoins });
        }

        if (result.contributionGained !== undefined) {
          updateMember(playerId, {
            contribution: (guild.members.find((m: any) => m.playerId === playerId)?.contribution || 0) + result.contributionGained,
          });
        }

        if (result.leveledUp) {
          showToast({
            type: 'success',
            title: '🎉 建筑升级！',
            content: `${selectedBuilding === 'dream_tower' ? '联合梦境塔' : '潜意识研究厅'} 升到 ${result.newLevel} 级！`,
          });
        }

        setMaterialContribution(0);
        setCoinContribution(0);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: '贡献失败',
        content: err?.response?.data?.error || err.message || '未知错误',
      });
    }
  };

  const buildings = [
    {
      name: '联合梦境塔',
      icon: '🏰',
      level: 5,
      experience: 3500,
      maxExperience: 5000,
      description: '公会成员共同建造的梦境之塔，提升全体成员的梦境稳定性',
      effect: '全体成员梦境稳定性 +5%，每升一级增加 1%',
      is3D: true,
    },
    {
      name: '潜意识研究厅',
      icon: '🔮',
      level: 3,
      experience: 1800,
      maxExperience: 3000,
      description: '研究潜意识奥秘的神秘厅堂，解锁更多词缀效果',
      effect: '稀有词缀出现概率 +3%，每升一级增加 0.5%',
      is3D: true,
    },
    {
      name: '守护者训练场',
      icon: '⚔️',
      level: 4,
      experience: 2800,
      maxExperience: 4000,
      description: '训练守护者的专用场地，提升守护者战斗能力',
      effect: '守护者攻击力 +10%，每升一级增加 2%',
      is3D: false,
    },
  ];

  const members = [
    {
      id: '1',
      nickname: '梦境编织者',
      avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=1',
      level: 25,
      position: '会长',
      contribution: 15680,
      joinedAt: '2024-01-15',
      isOnline: true,
    },
    {
      id: '2',
      nickname: '星尘织梦师',
      avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=2',
      level: 22,
      position: '副会长',
      contribution: 12450,
      joinedAt: '2024-02-10',
      isOnline: true,
    },
    ...Array(8).fill(null).map((_, i) => ({
      id: String(i + 3),
      nickname: `梦境旅人${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${i + 3}`,
      level: 10 + Math.floor(Math.random() * 15),
      position: ['精英成员', '正式成员', '见习成员'][Math.floor(Math.random() * 3)],
      contribution: Math.floor(Math.random() * 8000 + 1000),
      joinedAt: `2024-${String(Math.floor(Math.random() * 6 + 1)).padStart(2, '0')}-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}`,
      isOnline: Math.random() > 0.5,
    })),
  ].sort((a, b) => b.contribution - a.contribution);

  const totalContribution = members.reduce((sum, m) => sum + m.contribution, 0);
  const onlineCount = members.filter((m) => m.isOnline).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <motion.div
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-dream-purple to-dream-blue flex items-center justify-center text-5xl shadow-lg shadow-dream-purple/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              🏆
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{guild.name}</h1>
                <span className="px-2 py-0.5 rounded-full bg-dream-purple/20 text-dream-purple text-xs font-medium">
                  LV.{guild.level}
                </span>
              </div>
              <p className="text-dream-light/60 mb-4">{guild.description || '这是一个充满梦想和创造力的公会，欢迎所有热爱编织梦境的朋友加入！'}</p>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-dream-gold" />
                  <span className="text-sm">
                    会长: <span className="font-medium">{guild.leaderName || '梦境编织者'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-dream-blue" />
                  <span className="text-sm">
                    成员: <span className="font-medium">{members.length} / 50</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-dream-green" />
                  <span className="text-sm">
                    总贡献: <span className="font-medium">{totalContribution.toLocaleString()}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-dream-green animate-pulse" />
                  <span className="text-sm">
                    在线: <span className="font-medium text-dream-green">{onlineCount}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <MagicButton size="sm" variant="secondary">
                <Settings className="w-4 h-4" />
                管理
              </MagicButton>
              <MagicButton size="sm">
                <Gift className="w-4 h-4" />
                签到
              </MagicButton>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex gap-2 bg-dream-purple/10 p-1 rounded-xl inline-flex">
          {[
            { id: 'info', label: '公会信息', icon: Crown },
            { id: 'buildings', label: '建筑管理', icon: Settings },
            { id: 'members', label: '成员列表', icon: Users },
            { id: 'contribute', label: '贡献面板', icon: Plus },
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

      {activeTab === 'info' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GlassCard className="p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-dream-purple" />
              公会公告
            </h4>
            <div className="space-y-3">
              {[
                { title: '本周公会战开始', date: '今天 10:00', important: true },
                { title: '联合梦境塔升级到 5 级', date: '昨天 15:30', important: false },
                { title: '欢迎新成员加入', date: '3天前', important: false },
              ].map((notice, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border transition-colors ${
                    notice.important
                      ? 'bg-dream-red/10 border-dream-red/30'
                      : 'bg-dream-purple/10 border-dream-purple/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{notice.title}</span>
                    {notice.important && (
                      <span className="px-1.5 py-0.5 rounded bg-dream-red/30 text-dream-red text-xs">重要</span>
                    )}
                  </div>
                  <p className="text-xs text-dream-light/50">{notice.date}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-dream-green" />
              本周贡献排行
            </h4>
            <div className="space-y-2">
              {members.slice(0, 5).map((member, i) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-dream-purple/10 transition-colors"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-dream-gold text-white' :
                    i === 1 ? 'bg-gray-400 text-white' :
                    i === 2 ? 'bg-amber-600 text-white' :
                    'bg-dream-purple/20 text-dream-light/60'
                  }`}>
                    {i + 1}
                  </span>
                  <PlayerAvatar
                    player={{ ...member, level: member.level }}
                    size="sm"
                    showOnline
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.nickname}</p>
                    <p className="text-xs text-dream-light/50">{member.position}</p>
                  </div>
                  <span className="font-bold text-dream-gold text-sm">
                    {member.contribution.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Gift className="w-4 h-4 text-dream-gold" />
              公会福利
            </h4>
            <div className="space-y-3">
              {[
                { name: '每日签到奖励', desc: '领取金币和材料', claimed: false },
                { name: '周贡献礼包', desc: '贡献达到1000可领取', claimed: true },
                { name: '公会战奖励', desc: '每周日结算', claimed: false },
              ].map((reward, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-dream-purple/10 border border-dream-purple/20"
                >
                  <div>
                    <p className="font-medium text-sm">{reward.name}</p>
                    <p className="text-xs text-dream-light/50">{reward.desc}</p>
                  </div>
                  <MagicButton
                    size="sm"
                    disabled={reward.claimed}
                    variant={reward.claimed ? 'secondary' : 'success'}
                  >
                    {reward.claimed ? '已领取' : '领取'}
                  </MagicButton>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === 'buildings' && (
        <motion.div variants={itemVariants} className="space-y-4">
          {buildings.map((building) => (
            <BuildingCard
              key={building.name}
              {...building}
              onUpgrade={() => handleUpgrade(building.name)}
            />
          ))}
        </motion.div>
      )}

      {activeTab === 'members' && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-dream-blue" />
                成员列表
              </h4>
              <MagicButton size="sm">
                <Plus className="w-4 h-4" />
                邀请成员
              </MagicButton>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dream-purple/20">
                    <th className="text-left py-3 px-4 text-sm font-medium text-dream-light/50">排名</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dream-light/50">成员</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dream-light/50">职位</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dream-light/50">贡献</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dream-light/50">加入时间</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dream-light/50">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, i) => (
                    <tr
                      key={member.id}
                      className="border-b border-dream-purple/10 hover:bg-dream-purple/10 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-dream-gold text-white' :
                          i === 1 ? 'bg-gray-400 text-white' :
                          i === 2 ? 'bg-amber-600 text-white' :
                          'bg-dream-purple/20 text-dream-light/60'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar
                            player={{ ...member, level: member.level }}
                            size="sm"
                            showOnline
                          />
                          <div>
                            <p className="font-medium">{member.nickname}</p>
                            <p className="text-xs text-dream-light/50">Lv.{member.level}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.position === '会长' ? 'bg-dream-gold/20 text-dream-gold' :
                          member.position === '副会长' ? 'bg-dream-purple/20 text-dream-purple' :
                          member.position === '精英成员' ? 'bg-dream-blue/20 text-dream-blue' :
                          'bg-dream-green/20 text-dream-green'
                        }`}>
                          {member.position}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-dream-gold">
                          {member.contribution.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-dream-light/60 text-sm">
                        {member.joinedAt}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            member.isOnline ? 'bg-dream-green animate-pulse' : 'bg-dream-light/30'
                          }`} />
                          <span className="text-sm text-dream-light/60">
                            {member.isOnline ? '在线' : '离线'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === 'contribute' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-dream-green" />
              贡献面板
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dream-light/70 mb-2">
                  选择建筑
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedBuilding('dream_tower')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedBuilding === 'dream_tower'
                        ? 'border-dream-purple bg-dream-purple/20'
                        : 'border-dream-purple/20 hover:border-dream-purple/50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">🏰</span>
                    <span className="text-sm font-medium">联合梦境塔</span>
                  </button>
                  <button
                    onClick={() => setSelectedBuilding('research_hall')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedBuilding === 'research_hall'
                        ? 'border-dream-blue bg-dream-blue/20'
                        : 'border-dream-blue/20 hover:border-dream-blue/50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">🔮</span>
                    <span className="text-sm font-medium">潜意识研究厅</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dream-light/70 mb-2">
                  材料贡献 <span className="text-dream-red">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={materialContribution}
                    onChange={(e) => setMaterialContribution(Math.max(0, Number(e.target.value)))}
                    min={0}
                    max={currentPlayer?.materials || 1000}
                    className="flex-1 px-4 py-3 rounded-xl bg-dream-purple/10 border border-dream-purple/30 text-white focus:outline-none focus:border-dream-purple/60 transition-colors"
                    placeholder="请输入材料数量"
                  />
                  <span className="text-dream-light/50 whitespace-nowrap">
                    拥有: {currentPlayer?.materials?.toLocaleString() || 1000}
                  </span>
                </div>
                <p className="text-xs text-dream-light/50 mt-2">
                  每单位材料可获得 5 贡献值、10 建筑经验
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dream-light/70 mb-2">
                  金币贡献 <span className="text-dream-red">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={coinContribution}
                    onChange={(e) => setCoinContribution(Math.max(0, Number(e.target.value)))}
                    min={0}
                    max={currentPlayer?.coins || 50000}
                    className="flex-1 px-4 py-3 rounded-xl bg-dream-purple/10 border border-dream-purple/30 text-white focus:outline-none focus:border-dream-purple/60 transition-colors"
                    placeholder="请输入金币数量"
                  />
                  <span className="text-dream-light/50 whitespace-nowrap">
                    拥有: {currentPlayer?.coins?.toLocaleString() || 50000}
                  </span>
                </div>
                <p className="text-xs text-dream-light/50 mt-2">
                  每金币可获得 1 贡献值、0.5 建筑经验
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dream-gold/10 border border-dream-gold/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dream-light/70">预计获得贡献值</span>
                  <span className="text-2xl font-bold text-dream-gold">
                    {(materialContribution * 5 + coinContribution).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-dream-light/50">
                  <span>材料贡献: {materialContribution * 5}</span>
                  <span>金币贡献: {coinContribution}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-dream-gold/20">
                  <div className="flex items-center justify-between text-sm text-dream-light/50">
                    <span>预计建筑经验</span>
                    <span className="text-dream-blue font-medium">
                      +{Math.floor(materialContribution * 10 + coinContribution * 0.5)}
                    </span>
                  </div>
                </div>
              </div>

              <MagicButton className="w-full" onClick={handleContribute} disabled={isLoading}>
                <Plus className="w-4 h-4" />
                {isLoading ? '提交中...' : '提交贡献'}
              </MagicButton>

              <p className="text-xs text-dream-light/40 text-center">
                材料和金币都必须填写才能提交贡献
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-dream-blue" />
              贡献记录
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Array(10).fill(null).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-dream-purple/10 border border-dream-purple/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dream-green/30 to-dream-blue/30 flex items-center justify-center">
                      {i % 2 === 0 ? '📦' : '💰'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {i % 2 === 0
                          ? `贡献了 ${Math.floor(Math.random() * 100 + 10)} 材料`
                          : `贡献了 ${Math.floor(Math.random() * 5000 + 1000)} 金币`
                        }
                      </p>
                      <p className="text-xs text-dream-light/50">
                        {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <span className="text-dream-green font-medium">
                    +{Math.floor(Math.random() * 1000 + 100)}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
