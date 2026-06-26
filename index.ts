import express from 'express'
import { createSocket } from './src/wa-listener.js'
import { logger } from './src/lib/logger.js'
import path from 'path'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { generateWaActionsControllers } from './src/wa-handler/actions/actions.controllers.js'
import { createServer } from 'http'
import basicAuth from 'express-basic-auth'
import { config } from '@/config.js'
import { pinoHttp } from 'pino-http'
import { waUpsertWorker } from '@/lib/workers/wa-upsert.worker.js'
import { waUpsertQueue } from '@/lib/queues/wa-upsert.queue.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)




const port = Number(config.port) || 3000



const app = express()
app.use(pinoHttp({
  logger: logger,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return 'error'
    } else if (res.statusCode >= 400) {
      return 'warn'
    }
    return 'info'
  },
}))
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'New WebSocket connection')
  socket.on('disconnect', () => {
    logger.info({ socketId: socket.id }, 'WebSocket disconnected')
  })
})

express.static(path.join(__dirname, './src/assets'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))


app.get('/', (_, res) => {
  res.json({
    name: 'baileys-n8n',
    status: 'ok'
  })
})


app.get('/health', (_, res) => {
  res.json({ status: 'healthy' })
})

createSocket({
  onQr: (qr) => {
    logger.info('Emitting QR code to clients')
    io.emit('wa:qr', { qr })
  }
}
).then((sock) => {
  const router = generateWaActionsControllers(sock);
  app.use('/wa-actions', router);
  logger.info('WhatsApp socket created')
}).catch((err: unknown) => {
  logger.error({ err }, 'Failed to create WhatsApp socket')
})

app.get('/qr', basicAuth({
  users: { [config.qrBasicAuthUsername]: config.qrBasicAuthPassword },
  challenge: true,
}), (_, res) => {
  res.sendFile(path.join(__dirname, '/src/assets', 'qr.html'))
})


server.listen(port, () => {
  logger.info({ port }, 'Server is running')
})

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutting down gracefully')

  await Promise.allSettled([
    waUpsertWorker.close(),
    waUpsertQueue.close(),
  ])

  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
}

process.on('SIGINT', () => {
  shutdown('SIGINT').catch((error) => {
    logger.error({ error }, 'Failed graceful shutdown on SIGINT')
    process.exit(1)
  })
})

process.on('SIGTERM', () => {
  shutdown('SIGTERM').catch((error) => {
    logger.error({ error }, 'Failed graceful shutdown on SIGTERM')
    process.exit(1)
  })
})


