#!/usr/bin/node
import { promisify } from 'util';

const redis = require('redis');

/**
 * Class for performing operations with Redis service
 */
class RedisClient {
  constructor () {
    this.client = redis.createClient();
    this.isConnected = true;

    this.client.on('connect', () => {
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      console.error(`Redis error: ${err.message}`);
      this.isConnected = false;
    });
  }

  /**
   * Checks if connection to Redis is Alive
   */
  isAlive () {
    return this.isConnected;
  }

  /**
   * Creates a new key in redis with a specific TTL
   */
  async set (key, value, duration) {
    const setAsync = promisify(this.client.set).bind(this.client);
    await setAsync(key, value, 'EX', duration);
  }

  /**
   * gets value corresponding to key in redis
   */
  async get (key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    return getAsync(key);
  }

  /**
   * Deletes key in redis service
   */
  async del (key) {
    const delAsync = promisify(this.client.del).bind(this.client);
    return delAsync(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
