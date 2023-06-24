import crypto from 'crypto';
import readline from 'readline';
import os, { EOL } from 'os';
import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';

const USER_GREETING = 'Welcome to the File Manager, <username>!\n';
const DEFAULT_USERNAME = 'Username';
const DEFAULT_GOODBYE = 'Thank you for using File Manager, <username>, goodbye!\n';

const DEFAULT_CURRENT_FOLDER_NAVIGATION_TEXT = 'You are currently in <path>\n';
const CUSTOM_CURRENT_FOLDER_NAVIGATION_TEXT = '<path>> ';

const IS_CUSTOM_CURRENT_FOLDER_NAVIGATION = true;

const DEFAULT_ERROR_TEXT = 'Operation failed';

export class CLI {
  username = 'none';

  currentPath = os.homedir();

  readlineInterface = readline.createInterface(process.stdin, process.stdout);

  constructor() {
    this.readlineInterface.on('line', (data) => this.handleInput(data));
    this.readlineInterface.on('close', () => this.handleExit());
  }

  setUsername(username) {
    this.username = username || DEFAULT_USERNAME;
  }

  greetUser() {
    const getUserGreetingText = (name) => USER_GREETING.replace('<username>', name);
    this.print(getUserGreetingText(this.username));
  }

  handleExit() {
    const getUserGoodbyeText = (name) => DEFAULT_GOODBYE.replace('<username>', name);
    this.print(getUserGoodbyeText(this.username));
    process.exit();
  }

  print(string) {
    let pathText = DEFAULT_CURRENT_FOLDER_NAVIGATION_TEXT.replace('<path>', this.currentPath);
    if (IS_CUSTOM_CURRENT_FOLDER_NAVIGATION) {
      pathText = CUSTOM_CURRENT_FOLDER_NAVIGATION_TEXT.replace('<path>', this.currentPath);
    }

    const outputText = `${string}${pathText}`;

    this.readlineInterface.setPrompt(outputText);
    this.readlineInterface.prompt();
  }

  async list(listDirPath = '') {
    const dirPath = path.join(listDirPath);
    return fsPromises.readdir(dirPath);
  }

  async checkPathAccess(pathToCheck, constant = fsPromises.constants.F_OK) {
    try {
      await fsPromises.access(pathToCheck, constant);
      return { ok: true, err: '' };
    } catch (err) {
      return { ok: false, err };
    }
  }

  async readFile(pathToFile) {
    return (await fsPromises.readFile(pathToFile)).toString();
  }

  async createFile(pathToFile) {
    const isAvailable = await this.checkPathAccess(path.dirname(pathToFile), fsPromises.F_OK);
    if (isAvailable.ok) {
      return fsPromises.writeFile(pathToFile, '', { encoding: 'utf-8', flag: 'w' });
    }
    throw isAvailable.err;
  }

  async renameFile(srcFile, distFile) {
    const isAvailable = await this.checkPathAccess(srcFile, fsPromises.F_OK);
    if (isAvailable.ok) {
      return fsPromises.rename(srcFile, distFile);
    }
    throw isAvailable.err;
  }

  async copyFile(srcFile, distFile) {
    const isAvailable = await this.checkPathAccess(srcFile, fsPromises.R_OK);
    if (isAvailable.ok) {
      await this.createFile(distFile);

      const readableStream = fs.createReadStream(srcFile);
      const fileStream = fs.createWriteStream(distFile, { flags: 'w' });

      return readableStream.pipe(fileStream);
    }
    throw isAvailable.err;
  }

  async removeFile(pathToFile) {
    await fsPromises.access(pathToFile, fsPromises.F_OK);

    return fsPromises.unlink(pathToFile);
  }

  async getFileHash(pathToFile) {
    const isAvailable = await this.checkPathAccess(pathToFile, fsPromises.R_OK);
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
  }

  async handleInput(string) {
    if (string === '.exit') {
      this.handleExit();
      return;
    }

    if (string === 'ls') {
      try {
        const files = (await this.list(this.currentPath)).join('\n');
        this.print(`${files}\n`);
      } catch (err) {
        this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
      }
      return;
    }

    if (string === 'up') {
      const newPath = path.dirname(this.currentPath);
      const pathAvailable = (await this.checkPathAccess(newPath));
      if (pathAvailable.ok) {
        this.currentPath = newPath;
      }
      this.print('');
      return;
    }

    if (string.indexOf('cd') === 0) {
      const newPath = path.resolve(this.currentPath, string.replace('cd ', ''));
      const pathAvailable = (await this.checkPathAccess(newPath));
      if (pathAvailable.ok) {
        this.currentPath = newPath;
        this.print('');
      } else {
        this.print(`${DEFAULT_ERROR_TEXT}: ${pathAvailable.err}\n`);
      }

      return;
    }

    if (string.indexOf('cat') === 0) {
      const newPath = path.resolve(this.currentPath, string.replace('cat ', ''));
      const pathAvailable = (await this.checkPathAccess(newPath));
      if (pathAvailable.ok) {
        try {
          const fileContents = await await this.readFile(newPath);
          this.print(fileContents);
        } catch (err) {
          this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
        }
      } else {
        this.print(`${DEFAULT_ERROR_TEXT}: ${pathAvailable.err}\n`);
      }

      return;
    }

    if (string.indexOf('add') === 0) {
      const newPath = path.resolve(this.currentPath, string.replace('add ', ''));

      try {
        await this.createFile(newPath);

        this.print(`File "${string.replace('add ', '')}" has been created\n`);
      } catch (err) {
        this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
      }

      return;
    }

    if (string.indexOf('rm') === 0) {
      const newPath = path.resolve(this.currentPath, string.replace('rm ', ''));

      try {
        await this.removeFile(newPath);

        this.print(`File "${string.replace('rm ', '')}" has been removed\n`);
      } catch (err) {
        this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
      }

      return;
    }

    if (string.indexOf('rn') === 0) {
      const args = string.replace('rn ', '').split(' ');
      if (args.length === 2) {
        const srcFilePath = path.resolve(this.currentPath, args[0]);
        const distFilePath = path.resolve(this.currentPath, args[1]);
        try {
          await this.renameFile(srcFilePath, distFilePath);

          this.print(`File "${args[0]}" has been renamed\n`);
        } catch (err) {
          this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
        }
      } else {
        this.print(`${DEFAULT_ERROR_TEXT}: arguments is invalid\n`);
      }

      return;
    }

    if (string.indexOf('cp') === 0) {
      const args = string.replace('cp ', '').split(' ');
      if (args.length === 2) {
        const srcFilePath = path.resolve(this.currentPath, args[0]);
        const distFilePath = path.resolve(this.currentPath, args[1]);
        try {
          await this.copyFile(srcFilePath, distFilePath);

          this.print(`File "${args[0]}" has been copied\n`);
        } catch (err) {
          this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
        }
      } else {
        this.print(`${DEFAULT_ERROR_TEXT}: arguments is invalid\n`);
      }

      return;
    }

    if (string.indexOf('mv') === 0) {
      const args = string.replace('mv ', '').split(' ');
      if (args.length === 2) {
        const srcFilePath = path.resolve(this.currentPath, args[0]);
        const distFilePath = path.resolve(this.currentPath, args[1]);
        try {
          await this.copyFile(srcFilePath, distFilePath);
          await this.removeFile(srcFilePath);

          this.print(`File "${args[0]}" has been moved\n`);
        } catch (err) {
          this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
        }
      } else {
        this.print(`${DEFAULT_ERROR_TEXT}: arguments is invalid\n`);
      }

      return;
    }

    if (string.indexOf('os') === 0) {
      const command = string.replace('os --', '');
      let output = '';
      switch (command) {
        case 'EOL': {
          output = EOL;
          break;
        }
        case 'cpus': {
          output = os.cpus().length;
          break;
        }
        case 'homedir': {
          output = os.homedir();
          break;
        }
        case 'username': {
          output = os.userInfo().username;
          break;
        }
        case 'architecture': {
          output = os.arch();
          break;
        }
        default: {
          this.print(`Unknown argument: ${command}`);
        }
      }
      this.print(`${output}\n`);
      return;
    }

    if (string.indexOf('hash') === 0) {
      const newPath = path.resolve(this.currentPath, string.replace('hash ', ''));

      try {
        const hash = await this.getFileHash(newPath);

        this.print(`File hash is:\n${hash}\n`);
      } catch (err) {
        this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
      }

      return;
    }

    this.print(`Unknown command: "${string}"\n`);
  }
}
