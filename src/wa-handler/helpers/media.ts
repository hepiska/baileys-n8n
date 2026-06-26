import { downloadMediaMessage } from "@whiskeysockets/baileys"
import { mkdir, writeFile, readFile, unlink } from "fs/promises"

import path from "path"

interface DownloadedMediaFile {
  filePath: string
  fileName: string
  mimeType: string
}

const mimeToExtension = (mimeType: string) => {
  if (mimeType.includes('jpeg')) return 'jpg'
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('gif')) return 'gif'
  return 'bin'
}

export const downloadMediaToBuffer = async (message: Parameters<typeof downloadMediaMessage>[0]): Promise<Buffer> => {
  try {
    const media = await downloadMediaMessage(message, 'buffer', {})
    let buffer: Buffer

    if (Buffer.isBuffer(media)) {
      buffer = media
    } else if (media instanceof Uint8Array) {
      buffer = Buffer.from(media)
    } else if (media && typeof (media as AsyncIterable<unknown>)[Symbol.asyncIterator] === 'function') {
      const chunks: Buffer[] = []
      for await (const chunk of media as AsyncIterable<unknown>) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk)
          continue
        }
        if (chunk instanceof Uint8Array) {
          chunks.push(Buffer.from(chunk))
          continue
        }
        throw new TypeError('Invalid media chunk type received while downloading')
      }
      buffer = Buffer.concat(chunks)
    } else {
      throw new TypeError('Unsupported media payload returned from downloadMediaMessage')
    }

    return buffer
  } catch (error) {
    console.error('Error downloading media to buffer:', error)
    throw error
  }
}

export const downloadMedia = async (message: Parameters<typeof downloadMediaMessage>[0]) => {
  try {
    const media = await downloadMediaMessage(message, 'buffer', {})
    let buffer: Buffer

    if (Buffer.isBuffer(media)) {
      buffer = media
    } else if (media instanceof Uint8Array) {
      buffer = Buffer.from(media)
    } else if (media && typeof (media as AsyncIterable<unknown>)[Symbol.asyncIterator] === 'function') {
      const chunks: Buffer[] = []
      for await (const chunk of media as AsyncIterable<unknown>) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk)
          continue
        }
        if (chunk instanceof Uint8Array) {
          chunks.push(Buffer.from(chunk))
          continue
        }
        throw new TypeError('Invalid media chunk type received while downloading')
      }
      buffer = Buffer.concat(chunks)
    } else {
      throw new TypeError('Unsupported media payload returned from downloadMediaMessage')
    }

    const mimeType = (message.message as any)?.imageMessage?.mimetype || 'application/octet-stream'
    const extension = mimeToExtension(mimeType)
    const mediaDir = path.join(process.cwd(), 'tmp', 'wa-media')
    await mkdir(mediaDir, { recursive: true })

    const messageId = (message.key as any)?.id || `msg-${Date.now()}`
    const fileName = `${messageId}-${Date.now()}.${extension}`
    const filePath = path.join(mediaDir, fileName)

    await writeFile(filePath, buffer)

    const result: DownloadedMediaFile = {
      filePath,
      fileName,
      mimeType,
    }

    return result
  } catch (error) {
    console.error('Error downloading media:', error)
    throw error
  }
}

export const filePathToFileAndRemoveLocalFile = async (filePath: string, fileName: string, mimeType: string): Promise<File> => {
  try {
    const fileBuffer = await readFile(filePath)
    const file = new File([fileBuffer], fileName, {
      type: mimeType,
    })

    // Remove the local file after creating the File object
    await unlink(filePath)

    return file
  } catch (error) {
    console.error('Error creating File object or removing local file:', error)
    throw error
  }
}

export const readFileToBase64AndRemoveLocalFile = async (filePath: string): Promise<string> => {
  try {
    const base64String = await readFile(filePath, 'base64')
    await unlink(filePath)

    return base64String
  } catch (error) {
    console.error('Error reading file to base64 or removing local file:', error)
    throw error
  }
}