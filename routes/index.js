/***********************************
 * NPM DEPENDENCIES
 ************************************/
const express = require("express");
const passport = require("passport");
const csrf = require("csurf");

/***********************************
 * ROUTER CONFIGURATION
 ************************************/
//Import user schema
const File = require("../models/file");
const User = require("../models/user");

//Create router object
const router = express.Router();

//User CSRF to prevent cross site form submission
router.use(csrf());

//Get user/error info from session
router.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
})

//Handle connection to server at base directory
router.get("/", function(req, res, next){
    if (req.user) {
        Promise.all([
            File.find({owner: req.user.username})
            .sort({ createdAt: "descending"})
            .exec(),
            User.find().exec()
        ]).then(function([files, users]) {
                res.render("index", { files: files, users: users });
            })
            .catch(function(err){
                return next(err);
            });
    } else {
        res.render("index", { files: [] });
    }
});

/***********************************
 * EXPORTS
 ************************************/
//Export router
module.exports = router;
