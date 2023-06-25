import fsPromises from 'fs/promises';
import fs from 'fs';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';
import { checkPathAccess } from './utils.js';

export const compressFile = async (srcFilePath, distFilePath) => {
  const isAvailable = await checkPathAccess(srcFilePath, fsPromises.R_OK);
  if (isAvailable.ok) {
    const compressOutputStream = fs.createWriteStream(distFilePath);
    const inputFileStream = fs.createReadStream(srcFilePath);

    return inputFileStream.pipe(createBrotliCompress()).pipe(compressOutputStream);
  }
  throw isAvailable.err;
};

export const decompressFile = async (srcFilePath, distFilePath) => {
  const isAvailable = await checkPathAccess(srcFilePath, fsPromises.R_OK);
  if (isAvailable.ok) {
    const decompressOutputStream = fs.createWriteStream(distFilePath);
    const compressedInputFileStream = fs.createReadStream(srcFilePath);

    return compressedInputFileStream.pipe(createBrotliDecompress()).pipe(decompressOutputStream);
  }
  throw isAvailable.err;
};
