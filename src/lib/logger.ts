import { config } from '@/config.js'
import pino from 'pino'


export const logger = pino({
  level: config.logLevel
})