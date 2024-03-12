// import chai from 'chai';
// import chaiHttp from 'chai-http';
// import server from '../../server';
// import AuthController from '../../controllers/AuthController';
// import dbClient from '../../utils/db';
// import { v4 as uuidv4 } from 'uuid';
// import { ObjectId } from 'mongodb';

// chai.use(chaiHttp);
// const expect = chai.expect;

// describe('AuthController', () => {
//   describe('#getConnect()', () => {
//     it('should return a valid access token when given valid credentials', async () => {
//       // Create a user in the database
//       const user = {
//         email: 'test@example.com',
//         password: 'password123',
//       };
//       const hashedPassword = AuthController.pwdHashed(user.password);
//       await dbClient.userscollection.insertOne({
//         email: user.email,
//         password: hashedPassword,
//       });

//       // Make a request to the /connect endpoint
//       const res = await chai.request(server)
//         .post('/connect')
//         .set('Authorization', 'Basic ' + Buffer.from(`${user.email}:${user.password}`).toString('base64'))
//         .send();

//       // Check the response status code and JSON body
//       expect(res).to.have.status(200);
//       expect(res.body).to.be.an('object');
//       expect(res.body.token).to.be.a('string');

//       // Check that the access token is stored in Redis
//       const accessToken = res.body.token;
//       const userId = await redisClient.get(`auth_${accessToken}`);
//       expect(userId).to.equal(user._id.toString('utf8'));
//     });

//     it('should return a 401 status code and an error message when given invalid credentials', async () => {
//       // Make a request to the /connect endpoint with invalid credentials
//       const res = await chai.request(server)
//         .post('/connect')
//         .set('Authorization', 'Basic ' + Buffer.from(`invalid:invalid`).toString('base64'))
//         .send();

//       // Check the response status code and JSON body
//       expect(res).to.have.status(401);
//       expect(res.body).to.be.an('object');
//       expect(res.body.error).to.equal('Unauthorized');
//     });

//     it('should return a 401 status code and an error message when the user is not found', async () => {
//       // Make a request to the /connect endpoint with non-existent user credentials
//       const res = await chai.request(server)
//         .post('/connect')
//         .set('Authorization', 'Basic ' + Buffer.from(`nonexistent@example.com:password123`).toString('base64'))
//         .send();

//       // Check the response status code and JSON body
//       expect(res).to.have.status(401);
//       expect(res.body).to.be.an('object');
//       expect(res.body.error).to.equal('Unauthorized');
//     });

//     it('should return a 401 status code and an error message when the password is incorrect', async () => {
//       // Create a user in the database with an incorrect password
//       const user = {
//         email: 'test@example.com',
//         password: 'password123',
//       };
//       const hashedPassword = AuthController.pwdHashed(user.password + 'incorrect');
//       await dbClient.userscollection.insertOne({
//         email: user.email,
//         password: hashedPassword,
//       });

//       // Make a request to the /connect endpoint with the incorrect password
//       const res = await chai.request(server)
//         .post('/connect')
//         .set('Authorization', 'Basic ' + Buffer.from(`${user.email}:${user.password}`).toString('base64'))
//         .send();

//       // Check the response status code and JSON body
//       expect(res).to.have.status(401);
//       expect(res.body).to.be.an('object');
//       expect(res.body.error).to.equal('Unauthorized');
//     });
//   });

//   describe('#getDisconnect()', () => {
//     it('should delete the access token from Redis', async () => {
//       // Create a user in the database
//       const user = {
//         email: 'test@example.com',
//         password: 'password123',
//       };
//       const hashedPassword = AuthController.pwdHashed(user.password);
//       const userDoc = await dbClient.userscollection.insertOne({
//         email: user.email,
//         password: hashedPassword,
//       });

//       // Generate a new access token
//       const accessToken = uuidv4();
//       await redisClient.set(`auth_${accessToken}`, userDoc._id.toString('utf8'), 24*60*60);

//       // Make a request to the /disconnect endpoint
//       const res = await chai.request(server)
//         .get('/disconnect')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send();

//       // Check the response status code and JSON body
//       expect(res).to.have.status(200);
//       expect(res.body).to.be.an('object');
//       expect(res.body.message).to.equal('Disconnected');

//       // Check that the access token is deleted from Redis
//       const userId = await redisClient.get(`auth_${accessToken}`);
//       expect(userId).to.be.null;
//     });

//     it('should return a 401 status code and an error message when the access token is invalid', async () => {
//       // Make a request to the /disconnect endpoint with an invalid access token
//       const res = await chai.request(server)
//         .get('/disconnect')
//         .set('Authorization', 'Bearer invalid_token')
//         .send();

//       // Check the response status code and JSON body
//       expect(res).to.have.status(401);
//       expect(res.body).to.be.an('object');
//       expect(res.body.error).to.equal('Unauthorized');
//     });
//   });
// });
