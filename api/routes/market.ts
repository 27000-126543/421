import { Router, type Request, type Response } from 'express'
import { getDb, saveDb, generateId } from '../db/index.js'
import { getPriceSuggestion } from '../utils/priceSuggestor.js'
import type { MarketItem, Transaction, MarketItemType, Rarity } from '../../shared/types.js'

const router = Router()

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

  if (sortBy === 'price_asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    items.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'recent') {
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
  const { type, itemRarity } = req.body;

  const suggestion = await getPriceSuggestion(type as MarketItemType, itemRarity as Rarity);

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
    itemId,
    itemName,
    itemData,
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

router.post('/items/:id/buy', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { buyerId } = req.body;
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

  const buyer = db.data.players.find(p => p.id === buyerId);
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
    buyerId,
    sellerId: item.sellerId,
    price: item.price,
    createdAt: new Date().toISOString()
  };

  db.data.transactions.push(transaction);
  await saveDb();

  res.status(200).json({
    success: true,
    data: {
      transaction,
      item,
      buyerRemainingCoins: buyer.coins,
      sellerReceivedCoins: sellerReceive,
      fee
    }
  });
})

export default router
