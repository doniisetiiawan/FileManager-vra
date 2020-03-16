import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import flash from 'connect-flash';
import errorHandler from 'errorhandler';
import multiparty from 'connect-multiparty';
import config from './config.json';
import { connect } from './lib/db';
import {
  newx as usersNew,
  create as usersCreate,
} from './routes/users';
import {
  newx as sessionsNew,
  create as sessionsCreate,
  destroy as sessionsDestroy,
} from './routes/sessions';
import requireUserAuth from './routes/main';
import {
  index as filesIndex,
  show as filesShow,
  destroy as filesDestroy,
  create as filesCreate,
} from './routes/files';

const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  methodOverride((req, res) => {
    if (
      req.body
      && typeof req.body === 'object'
      && '_method' in req.body
    ) {
      // look in urlencoded POST bodies and delete it
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
  }),
);
app.use(cookieParser());
app.use(
  cookieSession({
    secret: config.sessionSecret,
    cookie: {
      maxAge: config.sessionMaxAge,
    },
  }),
);
app.use(flash());

app.get('/', requireUserAuth, filesIndex);
app.get('/files/:file', requireUserAuth, filesShow);
app.delete('/files/:file', requireUserAuth, filesDestroy);
app.post(
  '/files',
  multiparty(),
  requireUserAuth,
  filesCreate,
);
app.get('/users/new', usersNew);
app.post('/users', usersCreate);
app.get('/sessions/new', sessionsNew);
app.post('/sessions', sessionsCreate);
app.delete('/sessions', sessionsDestroy);

if (app.get('env') === 'development') {
  app.use(errorHandler());
}

app.use(express.static(`${__dirname}/public`));

connect();

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
