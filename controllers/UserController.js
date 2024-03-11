const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class UserController {
    static async getMe(req, res) {
        const token = req.headers['x-token'];
        if (!token) {
          res.status(401).json({ error: 'Unauthorized' }).end();
          return;
        }
        const id = await redisClient.get(`auth_${token}`);
        if (!id) {
          res.status(401).json({ error: 'Unauthorized' }).end();
          return;
        }
        const user = await dbClient.getUserById(id);
        if (!user) {
          res.status(401).json({ error: 'Unauthorized' }).end();
          return;
        }
        res.json({email: user.email, id: user._id}).end()
      }
}
module.exports = UserController;