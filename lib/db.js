import mongoose from 'mongoose';
import config from '../config.json';

const isValidationError = (err) => err.name === 'ValidationError'
  || err.message.includes('ValidationError');

const isDuplicateKeyError = (err) => err.message.includes('duplicate key');

const connect = () => {
  mongoose.connect(
    config.mongoUrl,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    },
    (err) => {
      if (err) {
        console.error(
          `database connection failure: \n${err.stack}`,
        );
        process.exit(1);
      }
    },
  );
};

export { isValidationError, isDuplicateKeyError, connect };
