import type { MessageUpsertType, proto } from '@whiskeysockets/baileys'
import { Queue, type ConnectionOptions } from 'bullmq'
import { config } from '@/config.js'
import { IMasaageEventPayload, mapMessageUpsertToEventPayload } from '@/wa-handler/helpers/maper.js'

export interface WaUpsertJobData {
  type: MessageUpsertType
  message: IMasaageEventPayload
}

export const waQueueConnection: ConnectionOptions = {
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
}

const queueName = config.waUpsertQueueName.replace(/:/g, '-')

export const waUpsertQueue = new Queue<WaUpsertJobData>(queueName, {
  connection: waQueueConnection,
})

const getUpsertJobId = (message: proto.IWebMessageInfo) => {
  const remoteJid = message.key?.remoteJid || 'unknown-jid'
  const id = message.key?.id || 'unknown-id'
  return `${remoteJid}-${id}`
}

export const enqueueUpsertMessages = async (type: MessageUpsertType, messages: proto.IWebMessageInfo[]) => {
  if (!messages.length) {
    return
  }

  await Promise.all(
    messages.map(async (message) =>
      waUpsertQueue.add(
        'wa-message-upsert',
        { type, message: await mapMessageUpsertToEventPayload(type, message) },
        {
          jobId: getUpsertJobId(message),
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 1000,
          removeOnFail: 1000,
        }
      )
    )
  ).catch((error) => {
    console.error('Error enqueuing WA upsert messages:', error)
    throw error
  })
}
