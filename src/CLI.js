import readline from 'readline';
import os from 'os';
import path from 'path';
import { checkPathAccess } from './utils.js';
import {
  list, readFile, renameFile, copyFile, removeFile, createFile,
} from './basicFileUtils.js';
import { getConstant } from './constantsUtils.js';
import { getFileHash } from './hashUtils.js';
import { compressFile, decompressFile } from './compressUtils.js';

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

  async handleInput(string) {
    if (string === '.exit') {
      this.handleExit();
      return;
    }

    if (string === 'ls') {
      try {
        const files = (await list(this.currentPath)).join('\n');
        this.print(`${files}\n`);
      } catch (err) {
        this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
      }
      return;
    }

    if (string === 'up') {
      const newPath = path.dirname(this.currentPath);
      const pathAvailable = (await checkPathAccess(newPath));
      if (pathAvailable.ok) {
        this.currentPath = newPath;
      }
      this.print('');
      return;
    }

    if (string.indexOf('cd') === 0) {
      const newPath = path.resolve(this.currentPath, string.replace('cd ', ''));
      const pathAvailable = (await checkPathAccess(newPath));
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
      const pathAvailable = (await checkPathAccess(newPath));
      if (pathAvailable.ok) {
        try {
          const fileContents = await await readFile(newPath);
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
        await createFile(newPath);

        this.print(`File "${string.replace('add ', '')}" has been created\n`);
      } catch (err) {
        this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
      }

      return;
    }

    if (string.indexOf('rm') === 0) {
      const newPath = path.resolve(this.currentPath, string.replace('rm ', ''));

      try {
        await removeFile(newPath);

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
          await renameFile(srcFilePath, distFilePath);

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
          await copyFile(srcFilePath, distFilePath);

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
          await copyFile(srcFilePath, distFilePath);
          await removeFile(srcFilePath);

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
      const output = getConstant(command);
      if (!output) {
        this.print(`Unknown argument: ${command}`);
        return;
      }

      this.print(`${output}\n`);
      return;
    }

    if (string.indexOf('hash') === 0) {
      const newPath = path.resolve(this.currentPath, string.replace('hash ', ''));

      try {
        const hash = await getFileHash(newPath);

        this.print(`File hash is:\n${hash}\n`);
      } catch (err) {
        this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
      }

      return;
    }

    if (string.indexOf('compress') === 0) {
      const args = string.replace('compress ', '').split(' ');
      if (args.length === 2) {
        const srcFilePath = path.resolve(this.currentPath, args[0]);
        const distFilePath = path.resolve(this.currentPath, args[1]);
        try {
          await compressFile(srcFilePath, distFilePath);

          this.print(`File "${args[0]}" has been compressed\n`);
        } catch (err) {
          this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
        }
      } else {
        this.print(`${DEFAULT_ERROR_TEXT}: arguments is invalid\n`);
      }

      return;
    }

    if (string.indexOf('decompress') === 0) {
      const args = string.replace('decompress ', '').split(' ');
      if (args.length === 2) {
        const srcFilePath = path.resolve(this.currentPath, args[0]);
        const distFilePath = path.resolve(this.currentPath, args[1]);
        try {
          await decompressFile(srcFilePath, distFilePath);

          this.print(`File "${args[0]}" has been decompress\n`);
        } catch (err) {
          this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
        }
      } else {
        this.print(`${DEFAULT_ERROR_TEXT}: arguments is invalid\n`);
      }

      return;
    }

    this.print(`Unknown command: "${string}"\n`);
  }
}
