/*
BACKEND DESIGN, Expected end-points:
sign in - POST request: success / fail
register - POST request: return new user object
/profile/:userID - GET request: return user
/image - PUT: return updated user object
*/

// Initialising express framework
const express = require('express');
//getting bcrypt node js
const bcrypt = require('bcrypt-nodejs');
//getting cors package
const cors = require('cors');
//importing knex
const knex = require('knex');

//importing controllers
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

//initializing db with knex
const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'qwertyuiop',
      database : 'smart-brain'
    }
  }
);

/* testing connection
 db.select('*').from('users').then(data => {
     console.log(data);
 }) */

const app = express();

/* Inbuilt express middleware similar to body parser, which parse request
Better than installing extra bodyparser dependency
Always remember this to avoid errors in check request with database */
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//using cors to allow cross-origin resource share
app.use(cors());

//Test database without sql
// const database = {
//     users: [
//         {
//             id: 123,
//             username: 'john',
//             email: 'john@gmail.com',
//             password: 'passcode',
//             entries: 0, //will be used to track score of photo submissions
//             joined: new Date()
//         },
//         {
//             id: 143,
//             username: 'james',
//             email: 'james@gmail.com',
//             password: 'passedcode',
//             entries: 0, //will be used to track score of photo submissions
//             joined: new Date()
//         }
//     ],
//     login: [
//         {
//             id: '235',
//             hash: '',
//             email: 'john@gmail.com'
//         }
//     ]
// }

//root route
app.get('/', (req, res) => {
    res.send('success!');
});

//SIGNIN ROUTE
//injecting dependency of handleSignin function 
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) });

//REGISTER ROUTE
//injecting dependency of handleRegister function 
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) });

//profile/:userID route
//injecting dependency of handleProfile function 
app.get('/profile/:id', (req, res) => { profile.handleProfile(req, res, db) });

//updating user to increase Image entries count
//injecting dependency of handleImage function 
app.put('/image', (req, res) => { image.handleImage(req, res, db) });

//post endpoint for image
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) });

//testing the server
app.listen(3001, () => {
    console.log('app is running on port 3001');
});
