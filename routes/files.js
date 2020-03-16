import File from '../models/file';

const index = (req, res, next) => {
  File.getByUserId(req.session.userId, (err, files) => {
    if (err) {
      return next(err);
    }

    res.send(files);
  });
};

const show = (req, res, next) => {
  const file = new File(
    req.session.userId,
    req.params.file,
  );

  file.exists((exists) => {
    if (!exists) {
      return res.status(404).send('Page Not Found');
    }

    res.sendFile(file.path);
  });
};

const destroy = (req, res, next) => {
  const file = new File(
    req.session.userId,
    req.params.file,
  );

  file.delete((err) => {
    if (err) {
      return next(err);
    }

    console.log('File successfully deleted!');
    req.flash('info', 'File successfully deleted!');
    res.redirect('/');
  });
};

const create = (req, res, next) => {
  if (!req.files.file || req.files.file.size === 0) {
    console.log('No file selected!');
    req.flash('error', 'No file selected!');
    return res.redirect('/');
  }

  const file = new File(
    req.session.userId,
    req.files.file.originalFilename,
  );

  file.save(req.files.file.path, (err) => {
    if (err) {
      return next(err);
    }

    console.log('File successfully uploaded!');
    req.flash('info', 'File successfully uploaded!');
    res.redirect('/');
  });
};

export {
  index, show, destroy, create,
};
