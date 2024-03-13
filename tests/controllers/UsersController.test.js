import { expect, use, should, request } from 'chai';
// import sinon from 'sinon';
import chaiHttp from 'chai-http';
import server from '../../server';
import dbClient from '../../utils/db';
// import redisClient from '../../utils/redis';
import { ObjectId } from 'mongodb';

use(chaiHttp);
should();

describe('test class UsersController', () => {
  const credentials = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
  let token = '';
  let userId = '';
  const user = {
    email: 'bob@dylan.com',
    password: 'toto1234!',
  };

  before(async () => {
    await dbClient.connect(); // Initialize the dbClient object
    await dbClient.userscollection.deleteMany({});
    await dbClient.filescollection.deleteMany({});
  });

  after(async () => {
    await dbClient.userscollection.deleteMany({});
    await dbClient.filescollection.deleteMany({});
  });

  // users
  describe('POST /users', () => {
    it('returns the id and email of created user', async () => {
      const response = await request(server).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body.email).to.equal(user.email);
      expect(body).to.have.property('id');
      expect(response.statusCode).to.equal(201);

      userId = body.id;
      const userMongo = await dbClient.userscollection.findOne({
        _id: ObjectId(body.id),
      });
      expect(userMongo).to.exist;
    });

    it('test exist email', async () => {
      const user = {
        password: 'toto1234!'
      };
      const response = await request(server).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body).to.deep.equal({ error: 'Missing email' });
      expect(response.statusCode).to.equal(400);
    });

    it('test exist password', async () => {
      const user = {
        email: 'bob@dylan.com'
      };
      const response = await request(server).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body).to.deep.equal({ error: 'Missing password' });
      expect(response.statusCode).to.equal(400);
    });

    it('test exist body', async () => {
      const user = {
        email: 'bob@dylan.com',
        password: 'toto1234!',
      };
      const response = await request(server).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body).to.deep.equal({ error: 'Already exist' });
      expect(response.statusCode).to.equal(400);
    });
  });
});
