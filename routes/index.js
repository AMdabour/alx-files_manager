#!/usr/bin/node
import AppController from '../controllers/AppController';
import AuthController from '../constrollers/AuthController';
import UsersController from '../controllers/UsersController';

const makeRoutes = (api) => {
  // should return if Redis is alive and if the DB is alive
  api.get('/status', AppController.getStatus);
  // should return the number of users and files in DB
  api.get('/stats', AppController.getStats);
  api.get('/connect', AuthController.getConnect);
  api.get('/disconnect', AuthController.getDisconnect);
  api.get('/users/me', UserController.getMe)
  // User Controller

  // should create a new user in DB
  api.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });
};

export default makeRoutes;
