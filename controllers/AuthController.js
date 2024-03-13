import { v4 as uuidv4 } from 'uuid';
const redisClient = require('../utils/redis');
import dbClient from '../utils/db';
const sha1 = require('sha1');
import userUtils from '../utils/user';
// const { getAuthHeader, pwdHashed, getToken } = require('../utilities/utils');
// const { decodeToken, getCredentials } = require('../utilities/utils');

class AuthController {
  static async getConnect(request, response) {
    const Authorization = request.header('Authorization') || '';

    const credentials = Authorization.split(' ')[1];

    if (!credentials) { return response.status(401).send({ error: 'Unauthorized' }); }

    const decodedCredentials = Buffer.from(credentials, 'base64').toString(
      'utf-8',
    );

    const [email, password] = decodedCredentials.split(':');

    if (!email || !password) { return response.status(401).send({ error: 'Unauthorized' }); }

    const sha1Password = sha1(password);

    const user = await userUtils.getUser({
      email,
      password: sha1Password,
    });

    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    const token = uuidv4();
    const key = `auth_${token}`;
    const hoursForExpiration = 24;

    await redisClient.set(key, user._id.toString(), hoursForExpiration * 3600);

    return response.status(200).send({ token });
  }

  static async getDisconnect(request, response) {
    const { userId, key } = await userUtils.getUserIdAndKey(request);

    if (!userId) return response.status(401).send({ error: 'Unauthorized' });

    await redisClient.del(key);

    return response.status(204).send();
  }
}
module.exports = AuthController;

