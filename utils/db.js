#!/usr/bin/node
const { MongoClient } = require('mongodb');
const mongo = require('mongodb');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

/**
 * Represents a MongoDB client for interacting with the 'files_manager' database.
 * @class
 */
class DBClient {
  constructor() {
    this.connect();
  }

  /**
   * Establishes a connection to the MongoDB server and initializes the 'users'
   * and 'files' collections.
   */
  async connect() {
    try {
      const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      this.db = client.db(DB_DATABASE);
      this.userscollection = this.db.collection('users');
      this.filescollection = this.db.collection('files');
    } catch (err) {
      console.error(`Error connecting to the database: ${err.message}`);
      this.db = false;
    }
  }

  /**
   * Checks if the connection to the MongoDB server is alive.
   */
  isAlive() {
    return Boolean(this.db);
  }

  /**
   * Retrieves the number of documents in the 'users' collection.
   */
  async nbUsers() {
    try {
      const ndbUser = await this.userscollection.countDocuments();
      return ndbUser;
    } catch (err) {
      console.error(`Error counting users: ${err.message}`);
      return -1;
    }
  }

  /**
   * Retrieves the number of documents in the 'files' collection.
   */
  async nbFiles() {
    try {
      const ndFiles = await this.filescollection.countDocuments();
      return ndFiles;
    } catch (err) {
      console.error(`Error counting files: ${err.message}`);
      return -1;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
