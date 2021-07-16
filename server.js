const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv');
const helmet = require('helmet');
const userRouter = require('./routes/userRouter');
const authRouter = require('./routes/authRouter');
const postsRouter = require('./routes/postsRouter');

const app = express();
dotenv.config();

// middlewares

app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => {
    console.log('connected to server');
  }
);

app.listen(4000, () => {
  console.log(`server is running at port 4000...`);
});
