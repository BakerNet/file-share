/***********************************
 * NPM DEPENDENCIES
 ************************************/
const express = require("express");
const csrf = require("csurf");

/***********************************
 * ROUTER CONFIGURATION
 ************************************/
//Import user schema
var User = require("../models/user");

var middleware = require("./middleware")

//Create router object
var router = express.Router();

//User CSRF to prevent cross site form submission
router.use(csrf());

//Render user profile
router.get("/users/:username", function(req, res, next){
    User.findOne({ username: req.params.username }).exec()
        .then(function(user){
            if (!user) { return next(404); }

            res.render("profile", { user: user });
        })
        .catch(function(err){
            return next(err);
        });
});


//Render profile edit page - must be logged in
router.get("/profile/edit", middleware.ensureAuthenticated, function(req, res){
    res.render("edit", { csrfToken: req.csrfToken() });
});

//Apply profile edit - must be logged in
router.post("/profile/edit", middleware.ensureAuthenticated, function(req, res, next){
    req.user.displayName = req.body.displayname;
    req.user.bio = req.body.bio;
    req.user.save()
        .then(function(){
            req.flash("info", "Profile updated!");
            res.redirect("/edit");
        })
        .catch(function(err){
            return next(err);
        });
});

/***********************************
 * EXPORTS
 ************************************/
//Export router
module.exports = router;
