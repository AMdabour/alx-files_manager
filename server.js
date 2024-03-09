#!/usr/bin/node
import express from 'express';
import makeRoutes from './routes/index';

const server = express();
const port = process.env.PORT || 5000;

server.use(express.json());
makeRoutes(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default server;
