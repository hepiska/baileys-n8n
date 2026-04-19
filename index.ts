import express from 'express'
import { createSocket } from './src/wa-listener.js'
import { logger } from './src/lib/logger.js'
import { generateWaActionsControllers } from './src/wa-handler/actions/actions.controllers.js'

const port = Number(process.env.PORT ?? 3000)

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_, res) => {
  res.json({
    name: 'baileys-n8n',
    status: 'ok'
  })
})


app.get('/health', (_, res) => {
  res.json({ status: 'healthy' })
})

createSocket().then((sock) => {
  const router = generateWaActionsControllers(sock);
  app.use('/wa-actions', router);
  logger.info('WhatsApp socket created')
}).catch((err: unknown) => {
  logger.error({ err }, 'Failed to create WhatsApp socket')
})


app.listen(port, () => {
  logger.info({ port }, 'Server is running')
})

