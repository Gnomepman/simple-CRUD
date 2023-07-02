import { getDatabase, saveDatabase } from './database/index';
import http from 'http';
import { User } from 'types';
import url from 'url';
import querystring from 'querystring';

const users: User[] = getDatabase();

const sendResponse = (
  res: http.ServerResponse,
  statusCode: number,
  data: unknown,
) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');

  const { pathname, search } = url.parse(req.url || '', true);

  if (pathname === '/api/users' && req.method === 'GET') {
    if (search) {
      const [, query] = search.split('?');
      const data = querystring.parse(String(query));

      if (!Number(data.id)) {
        sendResponse(res, 400, 'Invalid param type. Must be number');
        return;
      }

      const user = users.find((user) => user.id === Number(data.id));
      user
        ? sendResponse(res, 200, user)
        : sendResponse(res, 404, 'User not found');
    } else {
      sendResponse(res, 200, users);
    }
  }
  if (pathname === '/api/users' && req.method === 'POST') {
    req.on('data', (data) => {
      const userRequest = JSON.parse(data);

      if (!userRequest.username || !userRequest.age || !userRequest.hobbies) {
        sendResponse(res, 400, 'Required fields are missing');
        return;
      }

      const user: User = {
        id: users.length + 1,
        username: String(userRequest.username),
        age: Number(userRequest.age),
        hobbies: Array.from(userRequest.hobbies),
      };

      users.push(user);
      saveDatabase(users);
      sendResponse(res, 201, user);
    });
  }
});

server.listen(8000); // move to .env

// and test - monday evening
