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

const app = express();

//Inbuilt express middleware similar to body parser, which parse request
//Btter than installing extra bodyparser dependency
//Always remember this to avoid errors in check request with database
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//using cors to allow cross-origin resource share
app.use(cors());

const database = {
    users: [
        {
            id: 123,
            username: 'john',
            email: 'john@gmail.com',
            password: 'passcode',
            entries: 0, //will be used to track score of photo submissions
            joined: new Date()
        },
        {
            id: 143,
            username: 'james',
            email: 'james@gmail.com',
            password: 'passedcode',
            entries: 0, //will be used to track score of photo submissions
            joined: new Date()
        }
    ],
    login: [
        {
            id: '235',
            hash: '',
            email: 'john@gmail.com'
        }
    ]
}

//root route
app.get('/', (req, res) => {
    res.send(database.users);
});

//SIGNIN ROUTE
//checking if the database matches request
app.post('/signin', (req, res) => {
        // Load hash from your password DB.
    // bcrypt.compare("passedcode", '$2a$10$hmReqQwpvqrLwscYDkivxulLgQwxscfnSk2O5zuO82bRtGg/j1lBa', function(err, res) {
    //     // res == true
    //     console.log('my first try', res);
    // });
    // bcrypt.compare("veggies", '$2a$10$hmReqQwpvqrLwscYDkivxulLgQwxscfnSk2O5zuO82bRtGg/j1lBa', function(err, res) {
    //     // res = false
    //     console.log('my second try', res);
    // });

    if(req.body.email === database.users[0].email && req.body.password === database.users[0].password){
        res.json(database.users[0]);
    } else {
        res.status(400).json('error logging in');
    }
});

//REGISTER ROUTE
app.post('/register', (req, res) => {
    //destructuring to grab properties from the request body:
    const { email, password, username } = req.body;
    //hash function to hash password with bcrypt
    // bcrypt.hash(password, null, null, function(err, hash) {
    //     // Store hash in your password DB.
    //     console.log(hash);
    // });
    database.users.push(
        {
            id: 133,
            username: username,
            email: email,
            entries: 0, //will be used to track score of photo submissions
            joined: new Date()
        }
    );
    res.json(database.users[database.users.length - 1]);
});

//profile/:userID route
//looping through datatbase to find matching ID
app.get('/profile/:id', (req, res) => {
    //destructuring to get id varaible(property) from params
    const { id } = req.params;
    let found = false;
    //looping through user array to check user with id
    database.users.forEach((user) => {
        if(user.id == id){
            found = true;
            return res.json(user);
        }
    });
    //if the user is not found after looping through user array
    if(!found) {
        res.status(404).json('no such user');
    }
});

//updating user to increase entries count
app.put('/image', (req, res) => {
    //destructuring to get id varaible(property) from body
    const { id } = req.body;
    let found = false;
    //looping through user array to check user with id
    database.users.forEach((user) => {
        if(user.id == id){
            found = true;
            user.entries++
            return res.json(user.entries);
        }
    });
    if(!found) {
        res.status(404).json('no such user');
    }
});

//testing the server
app.listen(3001, () => {
    console.log('app is running on port 3001');
});

