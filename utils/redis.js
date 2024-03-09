import { promisify } from 'util';

const redis = require('redis');

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

  isAlive () {
    return this.isConnected;
  }

  async set (key, value, duration) {
    const setAsync = promisify(this.client.set).bind(this.client);
    await setAsync(key, value, 'EX', duration);
  }

  async get (key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    return getAsync(key);
  }

  async del (key) {
    const delAsync = promisify(this.client.del).bind(this.client);
    return delAsync(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
