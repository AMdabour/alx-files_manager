// #!/usr/bin/node
// const { MongoClient } = require('mongodb');
// const mongo = require('mongodb');

// const DB_HOST = process.env.DB_HOST || 'localhost';
// const DB_PORT = process.env.DB_PORT || 27017;
// const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
// const url = `mongodb://${DB_HOST}:${DB_PORT}`;

// /**
//  * Represents a MongoDB client for interacting with the 'files_manager' database.
//  * @class
//  */
// class DBClient {
//   // constructor() {
//   //   this.connect();
//   // }

//   // /**
//   //  * Establishes a connection to the MongoDB server and initializes the 'users'
//   //  * and 'files' collections.
//   //  */
//   // async connect() {
//   //   try {
//   //     const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
//   //     await client.connect();
//   //     this.db = client.db(DB_DATABASE);
//   //     this.userscollection = this.db.collection('users');
//   //     this.filescollection = this.db.collection('files');
//   //   } catch (err) {
//   //     console.error(`Error connecting to the database: ${err.message}`);
//   //     this.db = false;
//   //   }
//   // }
//   constructor() {
//     const host = (process.env.DB_HOST) ? process.env.DB_HOST : 'localhost';
//     const port = (process.env.DB_PORT) ? process.env.DB_PORT : 27017;
//     this.database = (process.env.DB_DATABASE) ? process.env.DB_DATABASE : 'files_manager';
//     const dbUrl = `mongodb://${host}:${port}`;
//     this.connected = false;
//     this.client = new MongoClient(dbUrl, { useUnifiedTopology: true });
//     this.client.connect().then(() => {
//       this.connected = true;
//     }).catch((err) => console.log(err.message));
//   }

//   /**
//    * Checks if the connection to the MongoDB server is alive.
//    */
//   isAlive() {
//     return Boolean(this.connected);
//   }

//   /**
//    * Retrieves the number of documents in the 'users' collection.
//    */
//   async nbUsers() {
//     try {
//       const ndbUser = await this.userscollection.countDocuments();
//       return ndbUser;
//     } catch (err) {
//       console.error(`Error counting users: ${err.message}`);
//       return -1;
//     }
//   }

//   /**
//    * Retrieves the number of documents in the 'files' collection.
//    */
//   async nbFiles() {
//     try {
//       const ndFiles = await this.filescollection.countDocuments();
//       return ndFiles;
//     } catch (err) {
//       console.error(`Error counting files: ${err.message}`);
//       return -1;
//     }
//   }

//   async getUser(email) {
//     await this.connect();
//     const user = await this.usersCollection.find({email}).toArray();
//     if (!user.length) {
//       return null
//     }
//     return user[0];
//   }

//   async getUserById(id) {
//     const user = await this.userscollection.findOne({ _id: new mongo.ObjectID(id)});
//     return user;
//   }
// }

// const dbClient = new DBClient();
// export default dbClient;
const { MongoClient } = require('mongodb');
const mongo = require('mongodb');
const { pwdHashed } = require('../utilities/utils');

class DBClient {
  constructor() {
    const host = (process.env.DB_HOST) ? process.env.DB_HOST : 'localhost';
    const port = (process.env.DB_PORT) ? process.env.DB_PORT : 27017;
    this.database = (process.env.DB_DATABASE) ? process.env.DB_DATABASE : 'files_manager';
    const dbUrl = `mongodb://${host}:${port}`;
    this.connected = false;
    this.client = new MongoClient(dbUrl, { useUnifiedTopology: true });
    this.client.connect().then(() => {
      this.connected = true;
    }).catch((err) => console.log(err.message));
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    await this.client.connect();
    const users = await this.client.db(this.database).collection('users').countDocuments();
    return users;
  }

  async nbFiles() {
    await this.client.connect();
    const users = await this.client.db(this.database).collection('files').countDocuments();
    return users;
  }

  async createUser(email, password) {
    const hashedPwd = pwdHashed(password);
    await this.client.connect();
    const user = await this.client.db(this.database).collection('users').insertOne({ email, password: hashedPwd });
    return user;
  }

  async getUser(email) {
    await this.client.connect();
    const user = await this.client.db(this.database).collection('users').find({ email }).toArray();
    if (!user.length) {
      return null;
    }
    return user[0];
  }

  async getUserById(id) {
    const _id = new mongo.ObjectID(id);
    await this.client.connect();
    const user = await this.client.db(this.database).collection('users').find({ _id }).toArray();
    if (!user.length) {
      return null;
    }
    return user[0];
  }

  async userExist(email) {
    const user = await this.getUser(email);
    if (user) {
      return true;
    }
    return false;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
