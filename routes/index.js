import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const makeRoutes = (api) => {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);
  api.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });
};

export default makeRoutes;
