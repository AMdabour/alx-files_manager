import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const makeRoutes = (api) => {
  // should return if Redis is alive and if the DB is alive
  api.get('/status', AppController.getStatus);
  // should return the number of users and files in DB
  api.get('/stats', AppController.getStats);
  // User Controller

  // should create a new user in DB
  api.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });
};

export default makeRoutes;
