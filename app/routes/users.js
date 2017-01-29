var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');

// post request for registering a user
router.post('/register', function (req, res) {
    var userUuid = uuid();
    User.register(new User({username: req.body.username, type: req.body.type, uuid: userUuid}), req.body.password, function (err, user) {
        if (err)
            return res.status(500).json({err: err});
        
        passport.authenticate('local')(req, res, function () {
            return res.status(200).json({status: 'registration-success'});
        });
    });
});

// post request for authenticating a user
router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err)
            return next(err);
        
        if (!user)
            return res.status(401).json({err: info});
        
        req.logIn(user, function (err) {
            if (err)
                res.status(500).json({err: 'Could not log in user'});
            
            console.log('User in users: ', user);
            
            var token = Verify.getToken(user);
            req.session.token = token;
            res.status(200).json({
                status: 'login-success',
                success: true,
                token: token
            });
        });
        
    })(req, res, next);
});

// get request for logging out a user
router.get('/logout', function (req, res) {
    req.session.token = null;
    req.logout();
    res.status(200).json({status: 'Successfully logged out'});
});

module.exports = router;