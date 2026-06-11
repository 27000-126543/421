import type { PriceSuggestion, MarketItemType, Rarity } from '../../shared/types.js';
import { getDb } from '../db/index.js';

const BASE_PRICES: Record<MarketItemType, Record<Rarity, number>> = {
  blueprint: {
    common: 100,
    rare: 500,
    epic: 2000,
    legendary: 10000
  },
  guardian: {
    common: 200,
    rare: 800,
    epic: 3500,
    legendary: 15000
  }
};

async function getPriceSuggestion(
  type: MarketItemType,
  itemRarity: Rarity
): Promise<PriceSuggestion> {
  const db = await getDb();
  const basePrice = BASE_PRICES[type][itemRarity];
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentSales = db.data.transactions
    .filter(t => {
      const item = db.data.marketItems.find(m => m.id === t.itemId);
      return item && item.type === type && item.itemRarity === itemRarity && 
             new Date(t.createdAt) >= sevenDaysAgo;
    })
    .map(t => ({
      price: t.price,
      date: t.createdAt
    }));

  const mockRecentSales = Array(10).fill(null).map((_, i) => ({
    price: Math.round(basePrice * (0.8 + Math.random() * 0.4)),
    date: new Date(Date.now() - i * 86400000).toISOString()
  }));

  const allSales = recentSales.length > 0 ? recentSales : mockRecentSales;
  
  const avgPrice = Math.round(
    allSales.reduce((sum, s) => sum + s.price, 0) / allSales.length
  );
  
  const prices = allSales.map(s => s.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const suggestedMin = Math.round(avgPrice * 0.85);
  const suggestedMax = Math.round(avgPrice * 1.15);

  return {
    avgPrice,
    minPrice,
    maxPrice,
    suggestedRange: [suggestedMin, suggestedMax],
    recentSales: allSales.slice(0, 7)
  };
}

export { getPriceSuggestion };
