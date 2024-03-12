import {
  expect, use, should, request,
} from 'chai';
import chaiHttp from 'chai-http';
import server from '../../server';
import dbClient from '../../utils/db';
use(chaiHttp);
should();

// General APP Endpoints ==============================================

describe('test class AppController', () => {
  describe('test GET /status', () => {
    it('getStatus function', async () => {
      const response = await request(server).get('/status').send();
      const body = JSON.parse(response.text);

      expect(body).to.eql({ redis: true, db: true });
      expect(response.statusCode).to.equal(200);
    });
  });
  describe('test GET /stats',() =>{
    before(async () => {
      await dbClient.userscollection.deleteMany({});
      await dbClient.filescollection.deleteMany({});
    });
    it('getstats function in 0 userscollection, 0 filescollection case', async() => {
      const response = await request(server).get('/stats').send();
      const body = JSON.parse(response.text);

      expect(body).to.eql({"users":0,"files":0});
      expect(response.statusCode).to.equal(200);
    });
    it('getstats function in n userscollection, n filescollection case', async() => {
      await dbClient.userscollection.insertOne({ name: 'beboo' });
      await dbClient.filescollection.insertOne({ name: 'beboo.png' });
      await dbClient.filescollection.insertOne({ name: 'beboo.txt' });
      const response = await request(server).get('/stats').send();
      const body = JSON.parse(response.text);

      expect(body).to.eql({"users":1,"files":2});
      expect(response.statusCode).to.equal(200);
    });
  });
});
