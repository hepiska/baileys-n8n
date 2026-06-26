import { Worker } from 'bullmq'
import { config } from '@/config.js'
import { logger } from '@/lib/logger.js'
import { messageUpsertCallback } from '@/wa-handler/message-callback.repository.js'
import type { WaUpsertJobData } from '@/lib/queues/wa-upsert.queue.js'
import { waQueueConnection } from '@/lib/queues/wa-upsert.queue.js'

const queueName = config.waUpsertQueueName.replace(/:/g, '-')

export const waUpsertWorker = new Worker<WaUpsertJobData>(
  queueName,
  async (job) => {
    const { type, message } = job.data
    await messageUpsertCallback(type, message)
  },
  {
    connection: waQueueConnection,
    concurrency: 5,
  }
)

waUpsertWorker.on('active', (job) => {
  logger.debug({ jobId: job.id, messageId: job.data.message.key?.id }, 'Processing WA upsert job')
})

waUpsertWorker.on('completed', (job) => {
  logger.debug({ jobId: job.id, messageId: job.data.message.key?.id }, 'Completed WA upsert job')
})

waUpsertWorker.on('failed', (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      messageId: job?.data.message.key?.id,
      error,
    },
    'Failed WA upsert job'
  )
})
