import User from '../models/user';
import File from '../models/file';
import {
  isValidationError,
  isDuplicateKeyError,
} from '../lib/db';

const newx = (req, res, next) => {
  res.send('users/new');
};

const create = (req, res, next) => {
  const user = new User({ username: req.body.username });

  user.saveWithPassword(req.body.password, (err) => {
    if (err) {
      if (isValidationError(err)) {
        console.log('Invalid username/password');
        req.flash('error', 'Invalid username/password');
        return res.redirect('/users/new');
      }
      if (isDuplicateKeyError(err)) {
        console.log('Username already exists');
        req.flash('error', 'Username already exists');
        return res.redirect('/users/new');
      }
      return next(err);
    }

    File.createFolder(user._id, (err) => {
      if (err) {
        return next(err);
      }

      console.log('Username created, you can now log in!');
      req.flash(
        'info',
        'Username created, you can now log in!',
      );
      res.redirect('/sessions/new');
    });
  });
};

export { newx, create };
