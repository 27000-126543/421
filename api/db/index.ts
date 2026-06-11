import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  Player, Weaver, Dream, MarketItem, Guild, Transaction,
  Notification, ServerEvent, VisitorData, RandomEvent, Battle,
  SceneElement, BattleSkill
} from '../../shared/types.js';
import {
  mockPlayers, mockWeavers, mockDreams, mockMarketItems, mockGuilds,
  sceneElements, battleSkills, generateId
} from '../../shared/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DatabaseSchema {
  players: Player[];
  weavers: Weaver[];
  dreams: Dream[];
  marketItems: MarketItem[];
  guilds: Guild[];
  transactions: Transaction[];
  notifications: Notification[];
  serverEvents: ServerEvent[];
  visitorData: VisitorData[];
  randomEvents: RandomEvent[];
  battles: Battle[];
  sceneElements: SceneElement[];
  battleSkills: BattleSkill[];
}

const defaultData: DatabaseSchema = {
  players: [],
  weavers: [],
  dreams: [],
  marketItems: [],
  guilds: [],
  transactions: [],
  notifications: [],
  serverEvents: [],
  visitorData: [],
  randomEvents: [],
  battles: [],
  sceneElements: [],
  battleSkills: []
};

const dbFilePath = path.join(__dirname, 'db.json');
const adapter = new JSONFile<DatabaseSchema>(dbFilePath);
const db = new Low<DatabaseSchema>(adapter, defaultData);

async function initDatabase(): Promise<void> {
  await db.read();
  
  if (db.data.players.length === 0) {
    db.data.players = [...mockPlayers];
  }
  if (db.data.weavers.length === 0) {
    db.data.weavers = [...mockWeavers];
  }
  if (db.data.dreams.length === 0) {
    db.data.dreams = [...mockDreams];
  }
  if (db.data.marketItems.length === 0) {
    db.data.marketItems = [...mockMarketItems];
  }
  if (db.data.guilds.length === 0) {
    db.data.guilds = [...mockGuilds];
  }
  if (db.data.sceneElements.length === 0) {
    db.data.sceneElements = [...sceneElements];
  }
  if (db.data.battleSkills.length === 0) {
    db.data.battleSkills = [...battleSkills];
  }
  if (db.data.serverEvents.length === 0) {
    db.data.serverEvents = [
      {
        id: `event-${generateId()}`,
        type: 'double_reward',
        name: '双倍奖励周',
        description: '所有探索收益翻倍！',
        effectValue: 2,
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() + 6 * 86400000).toISOString(),
        isActive: true
      }
    ];
  }
  
  await db.write();
}

async function getDb(): Promise<Low<DatabaseSchema>> {
  await db.read();
  return db;
}

async function saveDb(): Promise<void> {
  await db.write();
}

export { db, initDatabase, getDb, saveDb, generateId };
