import { config } from '@/config.js';
import ImageKit, { toFile } from '@imagekit/nodejs';

const client = new ImageKit({
  privateKey: config.imKitPrivateKey, // This is the default and can be omitted
});




const uploadFileToImageKit = async (fileBuffer: Buffer, fileName: string): Promise<ImageKit.Files.FileUploadResponse> => {
  try {
    return await client.files.upload({
      file: await toFile(fileBuffer),
      fileName: fileName,
      folder: '/cal_track',
    });;
  } catch (error) {
    throw error;
  }
};

export { uploadFileToImageKit };