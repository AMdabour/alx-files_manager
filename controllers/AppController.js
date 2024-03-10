#!/usr/bin/node
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AppController {
  /**
   * should return if Redis is alive and if the DB is alive too
   */
  static getStatus(req, res) {
    res.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  /**
   * should return the number of users and files in DB
   */
  static getStats(req, res) {
    Promise.all([dbClient.nbUsers(), dbClient.nbFiles()])
      .then(([usersCount, filesCount]) => {
        res.status(200).json({ users: usersCount, files: filesCount });
      });
  }
}
