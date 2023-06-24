import fsPromises from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { checkPathAccess } from './utils.js';

export const list = async (listDirPath = '') => {
  const dirPath = path.join(listDirPath);
  return fsPromises.readdir(dirPath);
};

export const readFile = async (pathToFile) => (await fsPromises.readFile(pathToFile)).toString();

export const createFile = async (pathToFile) => {
  const isAvailable = await checkPathAccess(path.dirname(pathToFile), fsPromises.F_OK);
  if (isAvailable.ok) {
    return fsPromises.writeFile(pathToFile, '', { encoding: 'utf-8', flag: 'w' });
  }
  throw isAvailable.err;
};

export const renameFile = async (srcFile, distFile) => {
  const isAvailable = await checkPathAccess(srcFile, fsPromises.F_OK);
  if (isAvailable.ok) {
    return fsPromises.rename(srcFile, distFile);
  }
  throw isAvailable.err;
};

export const copyFile = async (srcFile, distFile) => {
  const isAvailable = await checkPathAccess(srcFile, fsPromises.R_OK);
  if (isAvailable.ok) {
    await this.createFile(distFile);

    const readableStream = fs.createReadStream(srcFile);
    const fileStream = fs.createWriteStream(distFile, { flags: 'w' });

    return readableStream.pipe(fileStream);
  }
  throw isAvailable.err;
};

export const removeFile = async (pathToFile) => {
  await fsPromises.access(pathToFile, fsPromises.F_OK);

  return fsPromises.unlink(pathToFile);
};
