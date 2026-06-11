import { Router, type Request, type Response } from 'express'
import { getDb, saveDb, generateId } from '../db/index.js'
import { getPriceSuggestion } from '../utils/priceSuggestor.js'
import type { MarketItem, Transaction, MarketItemType, Rarity, ServerEvent } from '../../shared/types.js'

const router = Router()

function isSameDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}

router.get('/items', async (req: Request, res: Response): Promise<void> => {
  const { type, rarity, sortBy, page = 1, limit = 20 } = req.query;
  const db = await getDb();

  let items = [...db.data.marketItems.filter(i => i.status === 'active')];

  if (type) {
    items = items.filter(i => i.type === type);
  }
  if (rarity) {
    items = items.filter(i => i.itemRarity === rarity);
  }

  if (sortBy === 'price_asc' || sortBy === 'price-asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc' || sortBy === 'price-desc') {
    items.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'recent' || sortBy === 'newest') {
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const startIndex = (Number(page) - 1) * Number(limit);
  const paginatedItems = items.slice(startIndex, startIndex + Number(limit));

  res.status(200).json({
    success: true,
    data: {
      items: paginatedItems,
      total: items.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(items.length / Number(limit))
    }
  });
})

router.post('/items/suggest-price', async (req: Request, res: Response): Promise<void> => {
  const { type, itemRarity, rarity } = req.body;
  const actualType = type as MarketItemType;
  const actualRarity = (itemRarity || rarity) as Rarity;

  const suggestion = await getPriceSuggestion(actualType, actualRarity);

  res.status(200).json({
    success: true,
    data: suggestion
  });
})

router.post('/price-suggestion', async (req: Request, res: Response): Promise<void> => {
  const { type, rarity, itemRarity } = req.body;
  const actualType = type as MarketItemType;
  const actualRarity = (rarity || itemRarity) as Rarity;

  const suggestion = await getPriceSuggestion(actualType, actualRarity);

  res.status(200).json({
    success: true,
    data: suggestion
  });
})

router.post('/items/publish', async (req: Request, res: Response): Promise<void> => {
  const { sellerId, type, itemId, itemName, itemData, itemRarity, price } = req.body;
  const db = await getDb();

  const seller = db.data.players.find(p => p.id === sellerId);
  if (!seller) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  const suggestion = await getPriceSuggestion(type as MarketItemType, itemRarity as Rarity);

  const newItem: MarketItem = {
    id: `market-${generateId()}`,
    sellerId,
    sellerName: seller.nickname,
    sellerAvatar: seller.avatar,
    type,
    itemId: itemId || `item-${generateId()}`,
    itemName,
    itemData: itemData || {},
    itemRarity,
    price,
    suggestedPriceRange: suggestion.suggestedRange,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  db.data.marketItems.push(newItem);
  await saveDb();

  res.status(200).json({
    success: true,
    data: {
      item: newItem,
      priceSuggestion: suggestion
    }
  });
})

router.post('/items', async (req: Request, res: Response): Promise<void> => {
  const { sellerId, type, itemId, itemName, itemData, itemRarity, price } = req.body;
  const db = await getDb();

  const seller = db.data.players.find(p => p.id === sellerId);
  if (!seller) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  const suggestion = await getPriceSuggestion(type as MarketItemType, itemRarity as Rarity);

  const newItem: MarketItem = {
    id: `market-${generateId()}`,
    sellerId,
    sellerName: seller.nickname,
    sellerAvatar: seller.avatar,
    type,
    itemId: itemId || `item-${generateId()}`,
    itemName,
    itemData: itemData || {},
    itemRarity,
    price,
    suggestedPriceRange: suggestion.suggestedRange,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  db.data.marketItems.push(newItem);
  await saveDb();

  res.status(200).json({
    success: true,
    data: newItem
  });
})

router.post('/items/:id/buy', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { buyerId, playerId } = req.body;
  const actualBuyerId = buyerId || playerId;
  const db = await getDb();

  const item = db.data.marketItems.find(i => i.id === id);
  if (!item) {
    res.status(404).json({
      success: false,
      error: 'Item not found'
    });
    return;
  }

  if (item.status !== 'active') {
    res.status(400).json({
      success: false,
      error: 'Item is not available'
    });
    return;
  }

  const buyer = db.data.players.find(p => p.id === actualBuyerId);
  if (!buyer) {
    res.status(404).json({
      success: false,
      error: 'Buyer not found'
    });
    return;
  }

  if (buyer.coins < item.price) {
    res.status(400).json({
      success: false,
      error: 'Insufficient coins'
    });
    return;
  }

  const seller = db.data.players.find(p => p.id === item.sellerId);
  if (!seller) {
    res.status(404).json({
      success: false,
      error: 'Seller not found'
    });
    return;
  }

  const fee = Math.floor(item.price * 0.05);
  const sellerReceive = item.price - fee;

  buyer.coins -= item.price;
  seller.coins += sellerReceive;

  item.status = 'sold';

  const transaction: Transaction = {
    id: `tx-${generateId()}`,
    itemId: item.id,
    buyerId: actualBuyerId,
    sellerId: item.sellerId,
    price: item.price,
    createdAt: new Date().toISOString()
  };

  db.data.transactions.push(transaction);

  const announcement = {
    id: `notif-${generateId()}`,
    type: 'market_announcement',
    title: '全服成交公告',
    content: `🎉 玩家「${buyer.nickname}」以 ${item.price} 金币购入了 ${item.itemRarity === 'legendary' ? '传说级' : item.itemRarity === 'epic' ? '史诗级' : item.itemRarity === 'rare' ? '稀有级' : '普通级'}「${item.itemName}」！`,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  db.data.players.forEach(player => {
    db.data.notifications.push({
      ...announcement,
      id: `notif-${generateId()}`,
      playerId: player.id,
    });
  });

  const todayEvents = db.data.serverEvents.filter(
    e => e.type === 'nightmare_tide' && isSameDay(e.startTime, new Date().toISOString())
  );

  let tideEvent: ServerEvent;
  let previousEffect = 0;
  if (todayEvents.length === 0) {
    tideEvent = {
      id: `event-${generateId()}`,
      type: 'nightmare_tide',
      name: '梦魇潮汐',
      description: '交易市场的繁荣引来了梦魇潮汐，今日全服梦境稳定性下降 5%',
      effectValue: 5,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      isActive: true,
      affectedDreamIds: []
    };
    db.data.serverEvents.push(tideEvent);
    previousEffect = 0;
  } else {
    tideEvent = todayEvents[0];
    previousEffect = tideEvent.effectValue;
    tideEvent.effectValue = Math.min(20, tideEvent.effectValue + 1);
    tideEvent.description = `交易市场的繁荣引来了梦魇潮汐，今日全服梦境稳定性下降 ${tideEvent.effectValue}%`;
  }

  const effectIncrease = tideEvent.effectValue - previousEffect;
  if (effectIncrease > 0) {
    db.data.dreams.forEach((dream: any) => {
      const baseStability = dream.baseStability || dream.stability || 50;
      if (dream.baseStability === undefined) {
        dream.baseStability = dream.stability;
      }
      const currentReduction = 1 - (dream.stability / dream.baseStability);
      const newReduction = Math.min(0.5, currentReduction + effectIncrease / 100);
      dream.stability = Math.max(10, Math.floor(dream.baseStability * (1 - newReduction)));
    });
    tideEvent.affectedDreamIds = db.data.dreams.map((d: any) => d.id);
  }

  await saveDb();

  res.status(200).json({
    success: true,
    data: {
      transaction,
      item,
      buyerRemainingCoins: buyer.coins,
      sellerReceivedCoins: sellerReceive,
      fee,
      announcement,
      serverEvent: tideEvent
    }
  });
})

router.get('/events/active', async (req: Request, res: Response): Promise<void> => {
  const db = await getDb();
  const now = new Date().toISOString();

  const activeEvents = db.data.serverEvents.filter(
    e => e.isActive && e.startTime <= now && e.endTime >= now
  );

  res.status(200).json({
    success: true,
    data: activeEvents
  });
})

router.get('/transactions', async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 20, type } = req.query;
  const db = await getDb();

  let transactions = [...db.data.transactions];

  if (type) {
    const itemsOfType = db.data.marketItems.filter(i => i.type === type);
    const itemIds = new Set(itemsOfType.map(i => i.id));
    transactions = transactions.filter(t => itemIds.has(t.itemId));
  }

  transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const startIndex = (Number(page) - 1) * Number(limit);
  const paginated = transactions.slice(startIndex, startIndex + Number(limit));

  res.status(200).json({
    success: true,
    data: {
      transactions: paginated,
      total: transactions.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(transactions.length / Number(limit))
    }
  });
})

router.get('/items/my', async (req: Request, res: Response): Promise<void> => {
  const { playerId, page = 1, limit = 20 } = req.query;
  const db = await getDb();

  let items = db.data.marketItems.filter(i => i.sellerId === playerId);
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const startIndex = (Number(page) - 1) * Number(limit);
  const paginated = items.slice(startIndex, startIndex + Number(limit));

  res.status(200).json({
    success: true,
    data: {
      items: paginated,
      total: items.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(items.length / Number(limit))
    }
  });
})

export default router
