import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew (req, res) {
    // console.log('Request body:', req.body); identify if the request
    // body is reaching the handler with the expected data.
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
        password: hashedPassword
      });
    } catch (err) {
      console.error('Error creating user:', err);
      return res.status(500).send({ error: 'Error creating user.' });
    }
    const user = {
      id: result.insertedId,
      email
    };

    return res.status(201).send(user);
  }
}

export default UsersController;
