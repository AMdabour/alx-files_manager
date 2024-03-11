#!/usr/bin/node
import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db';
const redisClient = require('../utils/redis');

const userQueue = new Queue('userQueue');

class UsersController {
  /**
   * Creates a user using email and password
   */

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

  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });
    const existEmail = await dbClient.userscollection.findOne({ email });
    if (existEmail) return res.status(400).send({ error: 'Email already exists' });
    const hashedPassword = sha1(password);
    let result;
    try {
      result = await dbClient.userscollection.insertOne({
        email,
        password: hashedPassword,
      });
    } catch (err) {
      await userQueue.add({});
      return res.status(500).send({ error: 'Error creating user.' });
    }
    const users = {
      id: result.insertedId,
      email,
    };

    await userQueue.add({
      userId: result.insertedId.toString(),
    });

    return res.status(201).send(users);
  }
}
export default UsersController;
