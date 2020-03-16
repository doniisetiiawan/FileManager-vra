import User from '../models/user';

const newx = (req, res, next) => {
  res.send('sessions/new');
};

const create = (req, res, next) => {
  User.authenticate(
    req.body.username,
    req.body.password,
    (err, userData) => {
      if (err) {
        return next(err);
      }

      if (userData !== false) {
        req.session.username = userData.username;
        req.session.userId = userData._id;
        res.redirect('/');
      } else {
        console.log('Bad username/password');
        req.flash('error', 'Bad username/password');
        res.redirect('/sessions/new');
      }
    },
  );
};

const destroy = (req, res, next) => {
  delete req.session.username;
  delete req.session.userId;
  console.log('You have successfully logged out');
  req.flash('info', 'You have successfully logged out');
  res.redirect('/sessions/new');
};

export { newx, create, destroy };
