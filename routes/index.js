#!/usr/bin/node
import AppController from '../controllers/AppController';
import AuthController from '../constrollers/AuthController';
import UsersController from '../controllers/UsersController';
import FilesController from '../controllers/FilesController';

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
  api.post('/users', UsersController.postNew);
  // some endpoints related to files operations
  api.post('/files', FilesController.postUpload);
  api.get('/files', FilesController.getIndex);
  api.get('/files/:id', FilesController.getShow);
  api.put('/files/:id/publish', FilesController.putPublish);
  api.put('/files/:id/unpublish', FilesController.putUnpublish);
};

export default makeRoutes;
