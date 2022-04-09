const handleSignin = (req, res, db, bcrypt) => {
    // Compare function Load hash from your password DB async way.
    // bcrypt.compare("passedcode", '$2a$10$hmReqQwpvqrLwscYDkivxulLgQwxscfnSk2O5zuO82bRtGg/j1lBa', function(err, res) {
    //     // res == true
    //     console.log('my first try', res);
    // });
    // bcrypt.compare("veggies", '$2a$10$hmReqQwpvqrLwscYDkivxulLgQwxscfnSk2O5zuO82bRtGg/j1lBa', function(err, res) {
    //     // res = false
    //     console.log('my second try', res);
    // });

    //destructuring to grab properties from the request body:
    const { email, password } = req.body;

    //Ensuring email or password are not empty
    if(!email || !password){
        return res.status(400).json('wrong form submission');
    }

    db.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash); //bcrypt synchronous compare function
            if(isValid){
                return db.select('*').from('users') //always be sure to return this
                .where('email', '=', email)
                .then(user => {
                    res.json(user[0])
                })
                .catch(err => res.status(400).json('unable to get user'))
            } else{
                res.status(400).json('wrong credentials');
            }
        })
        .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = {
    handleSignin: handleSignin
}