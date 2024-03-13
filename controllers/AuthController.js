const { v4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');
const { getAuthHeader, pwdHashed, getToken } = require('../utilities/utils');
const { decodeToken, getCredentials } = require('../utilities/utils');

class AuthController {
  static async getConnect(req, res) {
    const header = getAuthHeader(req);
    if (!header) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    const token = getToken(header);
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    const { email, password } = getCredentials(decodedToken);
    const user = await dbClient.getUser(email);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    if (user.password !== pwdHashed(password)) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    const accessToken = v4();
    await redisClient.set(`auth_${accessToken}`, user._id.toString('utf8'), 24 * 60 * 60);
    res.json({ token: accessToken }).end();
  }

  static async getDisconnect(req, res) {
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
    await redisClient.del(`auth_${token}`);
    res.status(204).end();
  }
}

module.exports = AuthController;
