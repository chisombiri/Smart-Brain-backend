const handleProfile = (req, res, db) => {
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
}

module.exports = {
    handleProfile: handleProfile
}