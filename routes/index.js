import AppController from '../controllers/AppController';
import AuthController from '../constrollers/AuthController';
import UserController from '../controllers/UserController';

const makeRoutes = (api) => {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);
  api.get('/connect', AuthController.getConnect);
  api.get('/disconnect', AuthController.getDisconnect);
  api.get('/users/me', UserController.getMe)
};

export default makeRoutes;
