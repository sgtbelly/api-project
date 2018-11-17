'use strict';

import superagent from 'superagent';

import User from '../users-model.js';

// This is currently setup for Google, but we could easily swap it out
// for any other provider or even use a totally different module to
// to do this work.
//
// So long as the method is called "authorize" and we get the request,
// we should be able to roll on our own here...

const authorize = async (req) => {

  let code = req.query.code;

  console.log('(1) code', code);

  // exchange the code or a token
  let tokenResponse = await superagent.post('https://www.googleapis.com/oauth2/v4/token')
    .type('form')
    .send({
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.API_URL}/oauth`,
      grant_type: 'authorization_code',
    });
  
   let googleToken = tokenResponse.body.access_token;
   console.log('(2) google token', googleToken);
   
  // use the token to get a user
    let googleUserResponse = await superagent.get('https://www.googleapis.com/plus/v1/people/me/openIdConnect')
        .set('Authorization', `Bearer ${token}`);
    
    let googleUser = googleUserResponse.body;
    console.log('(3) Google User', googleUser);

    console.log('(4) Creating Account');
    let mongoAccount = await User.createFromOauth(googleUser);
    
    console.log('(5) Created User, generating token');
    let token = await mongoAccount.generateToken();
    
    return token;
};

const authorizex = (req) => {

  let code = req.query.code;

  console.log('(1) code', code);

  // exchange the code or a token
  return superagent.post('https://www.googleapis.com/oauth2/v4/token')
    .type('form')
    .send({
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.API_URL}/oauth`,
      grant_type: 'authorization_code',
    })
    .then( response => {
      let googleToken = response.body.access_token;
      console.log('(2) google token', googleToken);
      return googleToken;
    })
  // use the token to get a user
    .then ( token => {
      return superagent.get('https://www.googleapis.com/plus/v1/people/me/openIdConnect')
        .set('Authorization', `Bearer ${token}`)
        .then (response => {
          let user = response.body;
          console.log('(3) Google User', user);
          return user;
        });
    })
    .then(googleUser => {
      console.log('(4) Creating Account');
      return User.createFromOAuth(googleUser);
    })
    .then (user => {
      console.log('(5) Created User, generating token');
      return user.generateToken();
    })
    .catch(error=>error);
};



export default {authorize};
