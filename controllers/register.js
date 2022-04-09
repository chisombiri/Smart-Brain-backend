const handleRegister = (req, res, db, bcrypt) => {
    //destructuring to grab properties from the request body:
    const { email, password, username } = req.body;
    //async hash function to hash password with bcrypt
    // bcrypt.hash(password, null, null, function(err, hash) {
    //     // Store hash in your password DB.
    //     console.log(hash);
    // });

    //Ensuring email, password or username are not empty
    if(!username || !email || !password){
        return res.status(400).json('wrong form submission');
    }

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
}

module.exports = {
    handleRegister: handleRegister
}