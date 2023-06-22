import readline from 'readline';

const USER_GREETING = 'Welcome to the File Manager, <username>!\n';
const DEFAULT_USERNAME = 'Username';
const DEFAULT_GOODBYE = 'Thank you for using File Manager, <username>, goodbye!\n';

export class CLI {
  username = 'none';

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
    this.readlineInterface.setPrompt(string);
    this.readlineInterface.prompt();
  }

  handleInput(string) {
    if (string === '.exit') {
      this.handleExit();
    }
    this.print(`Unknown command: "${string}"\n`);
  }
}
