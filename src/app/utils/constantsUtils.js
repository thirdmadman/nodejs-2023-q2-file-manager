import os, { EOL } from 'os';

export const getConstant = (command) => {
  let output = '';
  switch (command) {
    case 'EOL': {
      output = EOL === '\r\n' ? '\\r\\n\r\n' : '\\n\n';
      break;
    }
    case 'cpus': {
      const getCpuString = (el, i) => `${i}:\t"${el.model}"\t${el.speed / 1000} GHz`;
      output = `${os.cpus().length} cores:\n${os.cpus().map(getCpuString).join('\n')}`;
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
