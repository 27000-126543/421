import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Filter, ArrowUpDown, Plus, Package, Coins, History } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';
import RarityBadge from '@/components/RarityBadge';
import PlayerAvatar from '@/components/PlayerAvatar';
import PriceChart from '@/components/market/PriceChart';
import { useMarketStore } from '@/store/useMarketStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useUIStore } from '@/store/useUIStore';
import type { MarketItem, MarketItemType, Rarity } from '../../shared/types';
import { mockMarketItems, mockPlayers } from '../../shared/mockData';

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

export default function Market() {
  const { currentPlayer } = usePlayerStore();
  const { items, cart, addToCart, getCartTotal, clearCart } = useMarketStore();
  const { showToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'market' | 'publish' | 'my-items'>('market');
  const [filterType, setFilterType] = useState<MarketItemType | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<Rarity | 'all'>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [publishType, setPublishType] = useState<MarketItemType>('blueprint');
  const [publishRarity, setPublishRarity] = useState<Rarity>('rare');
  const [publishPrice, setPublishPrice] = useState(500);
  const [publishItemName, setPublishItemName] = useState('');

  const allItems = items.length > 0 ? items : mockMarketItems;
  const myItems = allItems.filter((i) => i.sellerId === 'player-1');

  useEffect(() => {
    const interval = setInterval(() => {
      setPublishPrice((prev) => {
        const basePrice = { common: 100, rare: 500, epic: 2000, legendary: 10000 }[publishRarity];
        return basePrice + Math.floor(Math.random() * basePrice * 0.3);
      });
    }, 5000);
  }, [publishRarity]);

  const filteredItems = allItems
    .filter((item) => filterType === 'all' || item.type === filterType)
    .filter((item) => filterRarity === 'all' || item.itemRarity === filterRarity)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBuy = (item: MarketItem) => {
    addToCart(item);
    showToast({
      type: 'success',
      title: '已加入购物车',
      content: `${item.itemName} 已加入购物车`,
    });
  };

  const handleCheckout = () => {
    const total = getCartTotal();
    if (currentPlayer && currentPlayer.coins >= total) {
      showToast({
        type: 'success',
        title: '购买成功！',
        content: `花费 ${total} 金币购买了 ${cart.length} 件商品`,
      });
      clearCart();
    } else {
      showToast({
        type: 'error',
        title: '金币不足',
        content: '请先充值金币',
      });
    }
  };

  const handlePublish = () => {
    if (!publishItemName) {
      showToast({
        type: 'error',
        title: '请输入商品名称',
        content: '',
      });
      return;
    }
    showToast({
      type: 'success',
      title: '商品已上架',
      content: `${publishItemName} 已成功上架`,
    });
    setPublishItemName('');
  };

  const priceChartData = Array(7).fill(null).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const basePrice = { common: 100, rare: 500, epic: 2000, legendary: 10000 }[publishRarity];
    return {
      date: d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      price: basePrice + Math.floor(Math.random() * basePrice * 0.4 - basePrice * 0.2),
    };
  });

  const suggestedRange: [number, number] = (() => {
    const basePrice = { common: 100, rare: 500, epic: 2000, legendary: 10000 }[publishRarity];
    return [Math.floor(basePrice * 0.8), Math.floor(basePrice * 1.2)];
  })();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">交易市场</h1>
          <p className="text-dream-light/60">买卖梦境蓝图和守护者契约</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dream-gold/10 border border-dream-gold/30">
            <Coins className="w-5 h-5 text-dream-gold" />
            <span className="font-bold text-dream-gold">{currentPlayer?.coins?.toLocaleString() || 0}</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex gap-2 bg-dream-purple/10 p-1 rounded-xl inline-flex">
          {[
            { id: 'market', label: '商品列表', icon: ShoppingBag },
            { id: 'publish', label: '发布商品', icon: Plus },
            { id: 'my-items', label: '我的商品', icon: Package },
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
                {tab.id === 'market' && cart.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-dream-red text-xs flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {activeTab === 'market' && (
        <>
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-dream-light/50" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as MarketItemType | 'all')}
                className="px-3 py-2 rounded-lg bg-dream-purple/10 border border-dream-purple/30 text-white focus:outline-none focus:border-dream-purple/60"
              >
                <option value="all">全部类型</option>
                <option value="blueprint">蓝图</option>
                <option value="guardian">契约</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value as Rarity | 'all')}
                className="px-3 py-2 rounded-lg bg-dream-purple/10 border border-dream-purple/30 text-white focus:outline-none focus:border-dream-purple/60"
              >
                <option value="all">全部稀有度</option>
                <option value="common">普通</option>
                <option value="rare">稀有</option>
                <option value="epic">史诗</option>
                <option value="legendary">传说</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-dream-light/50" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 rounded-lg bg-dream-purple/10 border border-dream-purple/30 text-white focus:outline-none focus:border-dream-purple/60"
              >
                <option value="newest">最新上架</option>
                <option value="price-asc">价格从低到高</option>
                <option value="price-desc">价格从高到低</option>
              </select>
            </div>

            {cart.length > 0 && (
              <div className="ml-auto flex items-center gap-3">
                <span className="text-dream-gold font-bold">
                  总计: {getCartTotal().toLocaleString()} 金币
                </span>
                <MagicButton size="sm" onClick={handleCheckout}>
                  一键购买
                </MagicButton>
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassCard className="p-4 relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-dream-purple/20 transition-colors z-10"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.has(item.id)
                          ? 'text-dream-red fill-dream-red'
                          : 'text-dream-light/40'
                      }`}
                    />
                  </button>

                  <div className="h-28 rounded-xl bg-gradient-to-br from-dream-purple/30 to-dream-blue/30 mb-3 flex items-center justify-center">
                    <span className="text-4xl">{item.type === 'blueprint' ? '📜' : '📋'}</span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold truncate flex-1">{item.itemName}</h4>
                    <RarityBadge rarity={item.itemRarity} size="sm" showText={false} />
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs text-dream-light/50">
                    <PlayerAvatar
                      player={{
                        avatar: item.sellerAvatar,
                        nickname: item.sellerName,
                        level: 1,
                      }}
                      size="xs"
                    />
                    <span>{item.sellerName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-dream-gold">
                      <Coins className="w-4 h-4" />
                      <span className="font-bold">{item.price.toLocaleString()}</span>
                    </div>
                    <MagicButton
                      size="sm"
                      onClick={() => handleBuy(item)}
                      disabled={item.sellerId === 'player-1'}
                    >
                      {item.sellerId === 'player-1' ? '我的' : '购买'}
                    </MagicButton>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {activeTab === 'publish' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-dream-green" />
              发布商品
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dream-light/70 mb-2">
                  商品类型
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'blueprint', label: '蓝图', icon: '📜' },
                    { id: 'guardian', label: '契约', icon: '📋' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setPublishType(type.id as MarketItemType)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                        publishType === type.id
                          ? 'border-dream-purple bg-dream-purple/20'
                          : 'border-dream-purple/20 hover:border-dream-purple/40'
                      }`}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dream-light/70 mb-2">
                  商品名称
                </label>
                <input
                  type="text"
                  value={publishItemName}
                  onChange={(e) => setPublishItemName(e.target.value)}
                  placeholder="输入商品名称..."
                  className="w-full px-4 py-3 rounded-xl bg-dream-purple/10 border border-dream-purple/30 text-white placeholder-dream-light/40 focus:outline-none focus:border-dream-purple/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dream-light/70 mb-2">
                  稀有度
                </label>
                <div className="flex gap-2">
                  {(['common', 'rare', 'epic', 'legendary'] as Rarity[]).map((rarity) => (
                    <button
                      key={rarity}
                      onClick={() => setPublishRarity(rarity)}
                      className="flex-1 py-2"
                    >
                      <RarityBadge
                        rarity={rarity}
                        className={publishRarity === rarity ? 'ring-2 ring-dream-purple' : 'opacity-50'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dream-light/70 mb-2">
                  定价: {publishPrice} 金币
                </label>
                <div className="px-4 py-3 rounded-xl bg-dream-purple/10 border border-dream-purple/30">
                  <input
                    type="range"
                    min={suggestedRange[0]}
                    max={suggestedRange[1]}
                    value={publishPrice}
                    onChange={(e) => setPublishPrice(Number(e.target.value))}
                    className="w-full accent-dream-purple"
                  />
                  <div className="flex justify-between text-xs text-dream-light/50 mt-2">
                    <span>{suggestedRange[0]}</span>
                    <span className="text-dream-gold">建议区间</span>
                    <span>{suggestedRange[1]}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-dream-purple/20">
                <div className="text-right">
                  <p className="text-sm text-dream-light/50">系统将收取 5% 手续费</p>
                  <p className="text-lg font-bold text-dream-gold">
                    预计收入: {Math.floor(publishPrice * 0.95).toLocaleString()} 金币
                  </p>
                </div>
                <MagicButton onClick={handlePublish}>
                  <Plus className="w-4 h-4" />
                  上架
                </MagicButton>
              </div>
            </div>
          </GlassCard>

          <div className="space-y-6">
            <PriceChart data={priceChartData} suggestedRange={suggestedRange} />

            <GlassCard className="p-6">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-dream-blue" />
                我的成交记录
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Array(5).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-dream-purple/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{i % 2 === 0 ? '📜' : '📋'}</span>
                      <div>
                        <p className="font-medium text-sm">
                          {['古老花园蓝图', '梦境守护者契约', '深渊塔楼蓝图'][i % 3]}
                        </p>
                        <p className="text-xs text-dream-light/50">
                          {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <span className="text-dream-green font-medium">
                      +{Math.floor(Math.random() * 1000 + 200)}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}

      {activeTab === 'my-items' && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {myItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
              >
                <GlassCard className="p-4">
                  <div className="h-28 rounded-xl bg-gradient-to-br from-dream-purple/30 to-dream-blue/30 mb-3 flex items-center justify-center relative">
                    <span className="text-4xl">{item.type === 'blueprint' ? '📜' : '📋'}</span>
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'active'
                        ? 'bg-dream-green/20 text-dream-green'
                        : item.status === 'sold'
                        ? 'bg-dream-gold/20 text-dream-gold'
                        : 'bg-dream-red/20 text-dream-red'
                    }`}>
                      {item.status === 'active' ? '在售' : item.status === 'sold' ? '已售出' : '已过期'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold truncate">{item.itemName}</h4>
                    <RarityBadge rarity={item.itemRarity} size="sm" showText={false} />
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-dream-gold">
                      <Coins className="w-4 h-4" />
                      <span className="font-bold">{item.price.toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-dream-light/50">
                      {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>

                  {item.status === 'active' && (
                    <MagicButton
                      size="sm"
                      variant="danger"
                      className="w-full"
                    >
                      下架
                    </MagicButton>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
