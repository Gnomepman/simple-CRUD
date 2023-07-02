import fs from 'fs';
import { User } from 'types';

const path = './src/data/';
const filename = 'data.json';

const databaseExist = () => {
  try {
    return fs.existsSync(path + filename);
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const getDatabase = (): User[] | [] => {
  if (databaseExist()) {
    const users = fs.readFileSync(path + filename, 'utf8');
    return JSON.parse(users);
  } else {
    fs.mkdirSync(path);
    fs.writeFileSync(path + filename, '[]');
    return [];
  }
};

export const saveDatabase = (users: User[]) => {
  fs.writeFileSync(path + filename, JSON.stringify(users)); //add callback
};
