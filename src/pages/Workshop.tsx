import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wand2, Sparkles, UserPlus, Moon } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';
import RarityBadge from '@/components/RarityBadge';
import AffixBadge from '@/components/AffixBadge';
import PlayerAvatar from '@/components/PlayerAvatar';
import WeaverCard from '@/components/workshop/WeaverCard';
import SceneEditor from '@/components/workshop/SceneEditor';
import WeavingCalculator from '@/components/workshop/WeavingCalculator';
import WeavingResultModal from '@/components/workshop/WeavingResultModal';
import { endpoints } from '@/api/endpoints';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useDreamStore } from '@/store/useDreamStore';
import type { Weaver, SceneElement, Dream, AffixType } from '../../shared/types';
import { mockWeavers, mockDreams, sceneElements, dreamThemes } from '../../shared/mockData';

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

export default function Workshop() {
  const navigate = useNavigate();
  const { currentPlayer } = usePlayerStore();
  const { addDream } = useDreamStore();

  const [activeTab, setActiveTab] = useState<'weavers' | 'editor' | 'calculator' | 'my-dreams'>('weavers');
  const [myWeavers, setMyWeavers] = useState<Weaver[]>([]);
  const [availableWeavers, setAvailableWeavers] = useState<Weaver[]>([]);
  const [selectedWeavers, setSelectedWeavers] = useState<Weaver[]>([]);
  const [selectedElements, setSelectedElements] = useState<SceneElement[]>([]);
  const [myDreams, setMyDreams] = useState<Dream[]>([]);
  const [isWeaving, setIsWeaving] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [weavingResult, setWeavingResult] = useState<Dream | null>(null);
  const [triggeredAffixes, setTriggeredAffixes] = useState<AffixType[]>([]);
  const [dreamName, setDreamName] = useState('');

  useEffect(() => {
    const playerWeavers = mockWeavers.filter((w) => w.playerId === 'player-1');
    const others = mockWeavers.filter((w) => w.playerId !== 'player-1');
    setMyWeavers(playerWeavers);
    setAvailableWeavers(others);
    setMyDreams(mockDreams.filter((d) => d.ownerId === 'player-1'));
  }, []);

  const toggleWeaverSelection = (weaver: Weaver) => {
    if (selectedWeavers.find((w) => w.id === weaver.id)) {
      setSelectedWeavers(selectedWeavers.filter((w) => w.id !== weaver.id));
    } else if (selectedWeavers.length < 3) {
      setSelectedWeavers([...selectedWeavers, weaver]);
    }
  };

  const handleWeave = async () => {
    if (selectedWeavers.length === 0 || selectedElements.length === 0) return;

    setIsWeaving(true);

    setTimeout(() => {
      const baseStability = 50 + selectedWeavers.reduce((sum, w) => sum + w.level * 0.5, 0);
      const elementStability = selectedElements.reduce((sum, e) => sum + e.stabilityModifier, 0);
      const stability = Math.max(0, Math.min(100, baseStability + elementStability));

      const baseExp = 30 + selectedWeavers.reduce((sum, w) => sum + w.level * 0.8, 0);
      const elementExp = selectedElements.reduce((sum, e) => sum + e.experienceModifier, 0);
      const experienceScore = Math.max(0, Math.min(100, baseExp + elementExp));

      const affixChances: Record<AffixType, number> = {
        lucid: 0, precognition: 0, nightmare: 0, stable: 0, chaotic: 0,
      };
      selectedElements.forEach((e) => {
        Object.entries(e.affixBonus).forEach(([key, value]) => {
          affixChances[key as AffixType] += value * 2;
        });
      });

      const triggered: AffixType[] = [];
      (Object.entries(affixChances) as [AffixType, number][]).forEach(([affix, chance]) => {
        if (Math.random() * 100 < chance) triggered.push(affix);
      });

      const theme = dreamThemes[Math.floor(Math.random() * dreamThemes.length)];
      const result: Dream = {
        id: `dream-${Date.now()}`,
        ownerId: currentPlayer?.id || 'player-1',
        name: dreamName || `${theme}·${['秘境', '幻境', '梦境', '奇境'][Math.floor(Math.random() * 4)]}`,
        description: `由${currentPlayer?.nickname || '梦境旅人'}精心编织的神秘梦境。`,
        theme,
        weaverIds: selectedWeavers.map((w) => w.id),
        elementIds: selectedElements.map((e) => e.id),
        stability: Math.round(stability),
        experienceScore: Math.round(experienceScore),
        affixes: triggered,
        complexity: selectedWeavers.length * 10 + selectedElements.length * 5,
        isPublic: true,
        visitorCount: 0,
        favoriteCount: 0,
        createdAt: new Date().toISOString(),
      };

      setWeavingResult(result);
      setTriggeredAffixes(triggered);
      setShowResult(true);
      setIsWeaving(false);
      addDream(result);
      setMyDreams([result, ...myDreams]);
    }, 2000);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setSelectedWeavers([]);
    setSelectedElements([]);
    setDreamName('');
  };

  const tabs = [
    { id: 'weavers', label: '编织师管理', icon: UserPlus },
    { id: 'editor', label: '场景编辑器', icon: Wand2 },
    { id: 'calculator', label: '编织计算器', icon: Sparkles },
    { id: 'my-dreams', label: '我的梦境', icon: Moon },
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
          <h1 className="text-3xl font-bold gradient-text mb-2">梦境工坊</h1>
          <p className="text-dream-light/60">管理编织师，设计场景，编织独特梦境</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={dreamName}
            onChange={(e) => setDreamName(e.target.value)}
            placeholder="输入梦境名称..."
            className="px-4 py-2 rounded-xl bg-dream-purple/10 border border-dream-purple/30 text-white placeholder-dream-light/40 focus:outline-none focus:border-dream-purple/60 transition-colors"
          />
          <MagicButton
            onClick={handleWeave}
            loading={isWeaving}
            disabled={selectedWeavers.length === 0 || selectedElements.length === 0}
            glow
          >
            <Wand2 className="w-5 h-5" />
            开始编织
          </MagicButton>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex gap-2 bg-dream-purple/10 p-1 rounded-xl inline-flex">
          {tabs.map((tab) => {
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

      {activeTab === 'weavers' && (
        <motion.div variants={itemVariants} className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>🧙</span>
              我的编织师 ({selectedWeavers.length}/3 已选择)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {myWeavers.map((weaver) => (
                <WeaverCard
                  key={weaver.id}
                  weaver={weaver}
                  selected={selectedWeavers.some((w) => w.id === weaver.id)}
                  onSelect={() => toggleWeaverSelection(weaver)}
                />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>✨</span>
              可招募编织师
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {availableWeavers.slice(0, 5).map((weaver) => (
                <WeaverCard
                  key={weaver.id}
                  weaver={weaver}
                  showRecruit
                  onRecruit={() => {
                    setMyWeavers([...myWeavers, { ...weaver, id: `weaver-${Date.now()}` }]);
                    setAvailableWeavers(availableWeavers.filter((w) => w.id !== weaver.id));
                  }}
                />
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === 'editor' && (
        <motion.div variants={itemVariants}>
          <SceneEditor
            selectedElements={selectedElements}
            onElementsChange={setSelectedElements}
          />
        </motion.div>
      )}

      {activeTab === 'calculator' && (
        <motion.div variants={itemVariants}>
          <WeavingCalculator
            selectedWeavers={selectedWeavers}
            selectedElements={selectedElements}
          />
        </motion.div>
      )}

      {activeTab === 'my-dreams' && (
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDreams.map((dream) => (
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
                    {dream.affixes.map((affix) => (
                      <AffixBadge key={affix} affix={affix} size="sm" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-dream-light/60">稳定: {dream.stability}</span>
                      <span className="text-dream-light/40">|</span>
                      <span className="text-dream-light/60">经验: {dream.experienceScore}</span>
                    </div>
                    <PlayerAvatar
                      player={{
                        avatar: currentPlayer?.avatar || '',
                        nickname: '',
                        level: currentPlayer?.level || 1,
                      }}
                      size="xs"
                    />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <WeavingResultModal
        isOpen={showResult}
        onClose={handleCloseResult}
        result={weavingResult}
        triggeredAffixes={triggeredAffixes}
      />
    </motion.div>
  );
}
