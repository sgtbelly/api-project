'use strict';

import express from 'express';

const authRouter = express.Router();

import User from './users-model.js';
import Role from './roles-model.js';
import auth from './middleware.js';


// import oauth from './lib/oauth.js';
const oauth = require('./lib/oauth.js');

// These routes should support a redirect instead of just spitting out the token ...
authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then( (user) => {
      req.token = user.generateToken();
      req.user = user;
      res.cookie('auth', req.token);
      res.send(req.token);
    }).catch(next);
});

authRouter.post('/signin', auth(), (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.post('/roles', (req, res, next) => {
  let role = new Role(req.body);
  role.save()
    .then(result => res.send(result))
    .catch(next);
});

authRouter.get('/oauth', async (req, res, next) => {
  try {
    let token = await oauth.authorize(req);
    res.cookie('auth', token);
    res.send(token);
  }
  catch(e) { next(e); }
});

export default authRouter;
