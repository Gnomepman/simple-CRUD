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
    const { search } = url.parse(req.url || '', true);

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
  } else if (pathname === '/api/users' && req.method === 'POST') {
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
  } else if (pathname === '/api/users' && req.method === 'PUT') {
    const { search } = url.parse(req.url || '', true);
    if (search) {
      req.on('data', (data) => {
        const [, query] = search.split('?');
        const queryData = querystring.parse(String(query));
        const userRequest = JSON.parse(data);

        if (!Number(queryData.id)) {
          sendResponse(res, 400, 'Invalid param type. Must be number');
          return;
        }

        if (!userRequest.username || !userRequest.age || !userRequest.hobbies) {
          sendResponse(res, 400, 'Required fields are missing');
          return;
        }

        const user = users.find((user) => user.id === Number(queryData.id));

        if (!user) {
          sendResponse(res, 404, 'User not found');
          return;
        }

        user.username = String(userRequest.username);
        user.age = Number(userRequest.age);
        user.hobbies = Array.from(userRequest.hobbies);
        saveDatabase(users);

        sendResponse(res, 200, user);
      });
    } else {
      sendResponse(res, 404, 'Provide user`s id');
    }
  } else if (pathname === '/api/users' && req.method === 'DELETE') {
    if (search) {
      const [, query] = search.split('?');
      const data = querystring.parse(String(query));

      if (!Number(data.id)) {
        sendResponse(res, 400, 'Invalid param type. Must be number');
        return;
      }

      const index = users.findIndex((user) => user.id === Number(data.id));
      if (index === -1) {
        sendResponse(res, 404, 'User not found');
        return;
      }
      users.splice(index, 1);
      saveDatabase(users);
      sendResponse(res, 204, 'User was deleted');
    } else {
      sendResponse(res, 404, 'Provide user`s id');
    }
  } else {
    sendResponse(res, 404, 'Endpoint not found');
  }
});

server.listen(8000); // move to .env

// and test - monday evening
