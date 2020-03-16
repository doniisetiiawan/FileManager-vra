import mongoose from 'mongoose';
import pass from 'pwd';

const { Schema } = mongoose;

const validateUser = (username) => !!(username && /^[a-z][a-z0-9_-]{3,15}$/i.test(username));
const validatePassword = (pass) => !!(pass && pass.length > 5);

const User = new Schema(
  {
    username: {
      type: String,
      validate: validateUser,
      unique: true,
    },
    salt: String,
    hash: String,
  },
  {
    safe: true,
  },
);

// we cannot use a virtual password setter since this function is async
User.methods.setPassword = function (password, callback) {
  pass.hash(password, (err, salt, hash) => {
    if (err) {
      return callback(err);
    }

    this.hash = hash;
    this.salt = salt;

    callback();
  });
};

// validate the schema properties && other non-schema properties (password)
User.methods.validateAll = function (props, callback) {
  this.validate((err) => {
    if (err) {
      return callback(err);
    }

    if (!validatePassword(props.password)) {
      return callback(
        new Error('ValidationError: invalid password'),
      );
    }

    return callback();
  });
};

User.methods.saveWithPassword = function (
  password,
  callback,
) {
  this.validateAll({ password }, (err) => {
    if (err) {
      return callback(err);
    }

    this.setPassword(password, (err) => {
      if (err) {
        return callback(err);
      }

      this.save(callback);
    });
  });
};

User.statics.authenticate = function (
  username,
  password,
  callback,
) {
  // avoid making a call to the database for an invalid username/password
  if (
    !validateUser(username)
    || !validatePassword(password)
  ) {
    // keep this function async in all situations
    return process.nextTick(() => {
      callback(null, false);
    });
  }

  this.findOne({ username }, (err, user) => {
    if (err) {
      return callback(err);
    }
    // no such user in the database
    if (!user) {
      return callback(null, false);
    }

    pass.hash(password, user.salt, (err, hash) => {
      if (err) {
        return callback(err);
      }

      // if the auth was successful return the user details
      return user.hash === hash
        ? callback(null, user)
        : callback(null, false);
    });
  });
};

export default mongoose.model('User', User);
