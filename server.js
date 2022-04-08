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
//importing / initializing knex
const knex = require('knex');

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

//Inbuilt express middleware similar to body parser, which parse request
//Btter than installing extra bodyparser dependency
//Always remember this to avoid errors in check request with database
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
//checking if the database matches request
app.post('/signin', (req, res) => {
    // Compare function Load hash from your password DB async way.
    // bcrypt.compare("passedcode", '$2a$10$hmReqQwpvqrLwscYDkivxulLgQwxscfnSk2O5zuO82bRtGg/j1lBa', function(err, res) {
    //     // res == true
    //     console.log('my first try', res);
    // });
    // bcrypt.compare("veggies", '$2a$10$hmReqQwpvqrLwscYDkivxulLgQwxscfnSk2O5zuO82bRtGg/j1lBa', function(err, res) {
    //     // res = false
    //     console.log('my second try', res);
    // });

    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash); //bcrypt synchronous compare function
            if(isValid){
                return db.select('*').from('users') //always be sure to return this
                .where('email', '=', req.body.email)
                .then(user => {
                    res.json(user[0])
                })
                .catch(err => res.status(400).json('unable to get user'))
            } else{
                res.status(400).json('wrong credentials');
            }
        })
        .catch(err => res.status(400).json('wrong credentials'))
});

//REGISTER ROUTE
app.post('/register', (req, res) => {
    //destructuring to grab properties from the request body:
    const { email, password, username } = req.body;
    //async hash function to hash password with bcrypt
    // bcrypt.hash(password, null, null, function(err, hash) {
    //     // Store hash in your password DB.
    //     console.log(hash);
    // });

    //Storing with bcrypt synchronous way
    const hash = bcrypt.hashSync(password);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
    .into('login')
    .returning('email')
    .then(loginEmail => {
            return trx('users') //always be sure to return this
            .returning('*')
            .insert({
                name: username,
                email: loginEmail[0].email, 
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register')) //'unable to join' is better security-wise
});

//profile/:userID route
//looping through datatbase to find matching ID
app.get('/profile/:id', (req, res) => {
    //destructuring to get id varaible(property) from params
    const { id } = req.params;
    //looping through user array to check user with id
    db.select('*').from('users').where({
        id: id
    })
    .then(user => {
        if(user.length){
            res.json(user[0]);
        } else{
            res.status(400).json('Not Found'); //checking for empty array of user(i.e no user)
        }
    })
    .catch(err => res.status(400).json('Error getting user'))
});

//updating user to increase Image entries count
app.put('/image', (req, res) => {
    //destructuring to get id varaible(property) from body
    const { id } = req.body;
    //using 'incrememnt' from knex docs
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to get entries count'))
});

//testing the server
app.listen(3001, () => {
    console.log('app is running on port 3001');
});

