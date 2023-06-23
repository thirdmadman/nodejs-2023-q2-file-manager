import readline from 'readline';
import os from 'os';
import fsPromises from 'fs/promises';
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

  // eslint-disable-next-line class-methods-use-this
  async list(listDirPath = '') {
    const dirPath = path.join(listDirPath);
    return fsPromises.readdir(dirPath);
  }

  // eslint-disable-next-line class-methods-use-this
  async checkPathAccess(pathToCheck) {
    try {
      await fsPromises.access(pathToCheck, fsPromises.constants.R_OK);
      return { ok: true, err: '' };
    } catch (err) {
      return { ok: false, err };
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async readFile(pathToFile) {
    return (await fsPromises.readFile(pathToFile)).toString();
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
          console.log(fileContents);
          this.print(fileContents);
        } catch (err) {
          this.print(`${DEFAULT_ERROR_TEXT}: ${err}\n`);
        }
      } else {
        this.print(`${DEFAULT_ERROR_TEXT}: ${pathAvailable.err}\n`);
      }

      return;
    }

    this.print(`Unknown command: "${string}"\n`);
  }
}
