import { CLI } from "./CLI.js";

const USER_GREETING = 'Welcome to the File Manager';
const DEFAULT_USERNAME = 'Username';

export class App {

  cli = new CLI();

  constructor() {

    const getUserGreetingText = (name) =>  `${USER_GREETING}, ${name}!`;

    const getArgs = () => {
      const args = process.argv.slice(2);
      const combinedArgs = args.map((arg) => {
        const argArray = arg.replace('--', '').split('=');
        return {key: argArray[0], value: argArray[1]};
      });
      return(combinedArgs);
    };

    const userName = getArgs().find((obj) => obj.key === 'username').value || DEFAULT_USERNAME;

    this.cli.print(getUserGreetingText(userName));
  }
} 