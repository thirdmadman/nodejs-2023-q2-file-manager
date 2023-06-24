import os, { EOL } from 'os';

export const getConstant = (command) => {
  let output = '';
  switch (command) {
    case 'EOL': {
      output = EOL;
      break;
    }
    case 'cpus': {
      output = `${os.cpus().length} cores:\n${os.cpus().map((el) => el.model).join('\n')}`;
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
      output = null;
    }
  }
  return output;
};
