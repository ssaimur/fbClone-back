// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./routes/userRouter');
const authRouter = require('./routes/authRouter');
const postsRouter = require('./routes/postRouter');
const requireAuth = require('./middlewares/authMiddleware');
const errorHandler = require('./middlewares/error-handler');

const app = express();

app.use(
  cors({
    origin: '*',
  })
);
app.use(logger('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const url = process.env.MONGO_URI;
const connect = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// connect to the database
connect.then(
  () => {
    console.log('Connected to Database...');
  },
  (err) => console.log(err)
);

/* 
    GridFs Configuration
*/

// create storage engine
const storage = new GridFsStorage({
  db: connect,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

app.use('/api/auth', authRouter);
app.use(requireAuth);
app.use('/api/users', userRouter);
app.use('/api/posts', postsRouter(upload));

app.get('/', (req, res) => {
  res.send('Backend is listening...');
});

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(errorHandler);

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`the app is listening at port ${port}...`));

module.exports = app;
