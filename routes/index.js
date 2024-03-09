import AppController from '../controllers/AppController';

const makeRoutes = (api) => {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);
};

export default makeRoutes;