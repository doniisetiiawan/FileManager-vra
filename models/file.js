import fs from 'fs';
import async from 'async';
import path from 'path';

const ROOT = `${__dirname}/../files`;

class File {
  constructor(userId, name) {
    this.userId = userId;
    this.name = name;
    this.path = this._getPath();
  }

  _getPath() {
    return path.resolve(
      `${File.getUserPath(this.userId)}/${this.name}`,
    );
  }

  isValidFileName() {
    return /[a-z0-9_]/i.test(this.name);
  }

  exists(callback) {
    if (!this.isValidFileName()) {
      // keep the function async by not calling the function instantly (sync)
      return process.nextTick(() => {
        callback(null, false);
      });
    }

    fs.exists(this.path, callback);
  }

  delete(callback) {
    this.exists((exists) => {
      if (!exists) {
        return callback();
      }
      fs.unlink(this.path, callback);
    });
  }

  save(tempPath, callback) {
    if (!this.isValidFileName()) {
      return process.nextTick(() => {
        callback(null, new Error('Invalid filename'));
      });
    }

    const readStream = fs.createReadStream(tempPath);
    const writeStream = fs.createWriteStream(this.path);
    // if an error occurs invoke the callback with an error param
    readStream.on('error', callback);
    writeStream.on('error', callback);

    writeStream.on('close', callback);
    readStream.pipe(writeStream);
  }

  getStats(callback) {
    fs.stat(this.path, callback);
  }
}

File.getUserPath = (userId) => `${ROOT}/${userId}`;

// create a folder if it doesn't exist already
File.createFolder = (userId, callback) => {
  const userPath = File.getUserPath(userId);

  fs.exists(userPath, (exists) => {
    if (!exists) {
      fs.mkdir(userPath, callback);
    }
  });
};

File.getByUserId = (userId, callback) => {
  const getFiles = (files) => {
    if (!files) {
      return callback(null, []);
    }

    // get the stats for every file
    async.map(
      files,
      (name, done) => {
        const file = new File(userId, name);
        file.getStats((err, stats) => {
          if (err) {
            return done(err);
          }

          done(null, {
            name,
            stats,
          });
        });
      },
      callback,
    );
  };

  fs.readdir(File.getUserPath(userId), (err, files) => {
    if (err && err.code === 'ENOENT') {
      File.createFolder(userId, (err) => {
        if (err) {
          return callback(err);
        }

        getFiles(files);
      });
    } else if (!err) {
      getFiles(files);
    } else {
      return callback(err);
    }
  });
};

export default File;
