import fsPromises from 'fs/promises';
import fs from 'fs';
import { checkPathAccess } from './utils.js';

export const getFileHash = async (pathToFile) => {
  const isAvailable = await checkPathAccess(pathToFile, fsPromises.R_OK);
  if (isAvailable.ok) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const fileStream = fs.createReadStream(pathToFile);
      fileStream.on('error', (err) => reject(err));
      fileStream.on('data', (chunk) => hash.update(chunk));
      fileStream.on('end', () => resolve(hash.digest('hex')));
    });
  }
  throw isAvailable.err;
};
