import { v4 } from 'uuid';
import { fs } from 'fs';
import { ObjectID } from 'mongodb';
import mime from 'mime-types';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

class FilesController {
  static async getUser(request) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (userId) {
      const users = dbClient.db.collection('users');
      const idObject = new ObjectID(userId);
      const user = await users.findOne({ _id: idObject });
      if (!user) {
        return null;
      }
      return user;
    }
    return null;
  }

  static async postUpload(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const { name } = request.body;
    const { type } = request.body;
    const acceptedTypes = ['folder', 'file', 'image'];
    const { parentId } = request.body;
    const isPublic = request.body.isPublic || false;
    const { data } = request.body;
    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }
    if (!type || !acceptedTypes.includes(type) ) {
      return response.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return response.status(400).json({ error: 'Missing data' });
    }

    if (parentId) {
      const _id = new ObjectID(parentId);
      const file = await dbClient.db.collection('files').findOne({ _id, userId: user._id });
      if (!file) {
        return response.status(400).json({ error: 'Parent not found' });
      }
      if (file.type !== 'folder') {
        return response.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    if (type === 'folder') {
      dbClient.db.collection('files').insertOne(
        {
          userId: user._id,
          name,
          type,
          parentId: parentId || 0,
          isPublic,
        },
      ).then((result) => response.status(201).json({
        id: result.insertedId,
        userId: user._id,
        name,
        type,
        isPublic,
        parentId: parentId || 0,
      })).catch((error) => {
        console.log(error);
      });
    } else {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = `${folderPath}/${v4()}`;
      const buff = Buffer.from(data, 'base64');
      try {
        try {
          await fs.mkdir(folderPath);
        } catch (error) {
          console.log(error)
        }
        await fs.writeFile(fileName, buff, 'utf-8');
      } catch (error) {
        console.log(error);
      }
      dbClient.db.collection('files').insertOne(
        {
          userId: user._id,
          name,
          type,
          isPublic,
          parentId: parentId || 0,
          localPath: fileName,
        },
      ).then((result) => {
        response.status(201).json(
          {
            id: result.insertedId,
            userId: user._id,
            name,
            type,
            isPublic,
            parentId: parentId || 0,
          },
        );
        if (type === 'image') {
          fileQueue.add(
            {
              userId: user._id,
              fileId: result.insertedId,
            },
          );
        }
      }).catch((error) => console.log(error));
    }
    return null;
  }

  static async getShow(req, res) {
    const user = FilesController.getUser(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const id = req.params.id;
    const _id = new ObjectID(id);
    const file = await dbClient.db.collection('files').findOne({_id, userId: user._id});
    if (!file) {
        res.status(404).json({error: 'Not found'});
    }
    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const {parentID} = req.query.parentID || 0;
    const {page} = req.query.page || 0;
    const query = {parentID: ObjectID(parentID), userId: user._id };
    const aggregatePipeline  = [
      {$match : query},
      {$sort: {_id: -1}},
      {
        $facet: {
            metadata: [{ $count: 'total' }, { $addFields: { page: parseInt(pageNum, 10) } }],
            data: [{ $skip: 20 * parseInt(pageNum, 10) }, { $limit: 20 }],
          },
      }
    ]
    const result = await dbClient.db.collection('files').aggregate(
    aggregatePipeline
    ).toArray((err, result) => {
        if (result) {
            const finalResult = result[0].data.map(file => {
                const tmpFile = {
                    ...file,
                    id: file._id
                }
                delete tmpFile._id;
                delete tmpFile.localPath;
                return tmpFile;
            });
            return res.status(200).json(finalResult);
        }
        res.status(404).json({error: 'Not found'});
    });
    return null;
  }

  static async putPublish(req, res) {
    const user = FilesController.getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized'});
    }
    const _id = new ObjectID(req.params.id);
    const newValue = { $set: { isPublic: truee } };
    const options = { returnOriginal: false };
    dbClient.db.collection('files').findOneAndUpdate({ _id, userId: user._id }, newValue, options, (err, file) => {
      if (!file.lastErrorObject.updatedExisting) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(file);
    })
  }

  static async putUnpublish(req, res) {
    const user = await FilesController.getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized'});
    }
    const _id = new ObjectID(req.params.id);
    const newValue = { $set: { isPublic: false } };
    const options = { returnOriginal: false };
    dbClient.db.collection('files').findOneAndUpdate({ _id, userId: user._id }, newValue, options, (err, file) => {
      if (!file.lastErrorObject.updatedExisting) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(file);
    })
  }
}

module.exports = FilesController;
