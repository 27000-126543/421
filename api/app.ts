import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { initDatabase } from './db/index.js'
import authRoutes from './routes/auth.js'
import workshopRoutes from './routes/workshop.js'
import dreamsRoutes from './routes/dreams.js'
import arenaRoutes from './routes/arena.js'
import marketRoutes from './routes/market.js'
import guildRoutes from './routes/guild.js'
import reportsRoutes from './routes/reports.js'
import rankingsRoutes from './routes/rankings.js'
import playerRoutes from './routes/player.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

initDatabase().catch(err => {
  console.error('Failed to initialize database:', err)
})

app.use('/api/auth', authRoutes)
app.use('/api/workshop', workshopRoutes)
app.use('/api/dreams', dreamsRoutes)
app.use('/api/arena', arenaRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/guild', guildRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/rankings', rankingsRoutes)
app.use('/api/player', playerRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
