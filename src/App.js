import { CLI } from './CLI.js';

export class App {
  cli = new CLI();

  constructor() {
    console.clear();
    const getArgs = () => {
      const args = process.argv.slice(2);
      const combinedArgs = args.map((arg) => {
        const argArray = arg.replace('--', '').split('=');
        return { key: argArray[0], value: argArray[1] };
      });

      return combinedArgs;
    };

    const userName = getArgs().find((obj) => obj.key === 'username').value;

    this.cli.setUsername(userName);
    this.cli.greetUser();
  }
}
