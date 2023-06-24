import fsPromises from 'fs/promises';

export const checkPathAccess = async (pathToCheck, constant = fsPromises.constants.F_OK) => {
  try {
    await fsPromises.access(pathToCheck, constant);
    return { ok: true, err: '' };
  } catch (err) {
    return { ok: false, err };
  }
};
