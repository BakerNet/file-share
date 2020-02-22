/***********************************
 * NPM DEPENDENCIES
 ************************************/
const express = require("express");
const csrf = require("csurf");
const multer = require("multer");
const redis = require("redis");

/***********************************
 * ROUTER CONFIGURATION
 ************************************/
//Import user schema
const File = require("../models/file");

const middleware = require("./middleware");
const conf = require("../config/config.json");

const client = redis.createClient();
client.on("error", err => {
    console.error(err)
})

const upload = multer({ dest: conf.uploadDir });

//Create router object
const router = express.Router();

router.get("/file/upload", middleware.ensureAuthenticated, function(req, res){
    res.render("upload", { csrfToken: req.csrfToken() });
});

router.post("/file/upload", middleware.ensureAuthenticated, upload.single("file"), csrf(), function(req, res, next){
   const newFile = new File({
        owner: req.user.username,
        displayName: req.body.displayName || undefined,
        fileName: req.file.originalname,
        fileUrl: `${conf.uploadDir}${req.file.filename}`
    });
    newFile.save().then(() => {
        res.redirect("/")
    }).catch(err => {
        next(err)
    })
});

router.get("/file/grantAccess/:fileId", middleware.ensureAuthenticated, function(req, res, next){
    if (!req.query.username) {
        next("Missing username")
    }
    File.findOne({_id: req.params.fileId, owner: req.user.username}).then(file => {
        file.accessGranted.push(req.query.username)
        file.save()
        next()
    }).catch(err => {
        next(err)
    })
})

router.get("/file/createLink/:fileId", middleware.ensureAuthenticated, function(req, res, next){
    File.findOne({_id: req.params.fileId, owner: req.user.username}).then(file => {
        const access_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        client.set(`access:${file.id}:${access_token}`, 1, 'EX', 60 * 60 * 24);
        res.json({
            path: `/file/share/${file.fileUrl}/${access_token}`
        })
    }).catch(err => {
        next(err)
    })
})

router.get("/file/share/uploads/:fileName/:access_token", function(req, res, next){
    const filePath = `${conf.uploadDir}${req.params.fileName}`
    File.findOne({fileUrl: filePath}).then(file => {
        res.render("download", {file: file, access_token: req.params.access_token})
    }).catch(err => {
        next(err)
    })
})

router.all('/file/download/uploads/:fileName', function(req, res, next){
    const filePath = `${conf.uploadDir}${req.params.fileName}`
    File.findOne({fileUrl: filePath}).then(file => {
        if (req.user && file.owner === req.user.username) {
            next()
        } else if (req.query.access) {
            console.log("client get")
            client.get(`access:${file.id}`, function(err, reply) {
                if (err) {
                    next("Access token not found")
                }
                next()
            })
        } else if (req.user) {
            if (file.accessGranted.indexOf(requ.user.username) !== -1) {
                next()
            } else {
                next("Unable to access file")
            }
        } else {
            next("Unable to access file")
        }
    }).catch(err => {
        next(err)
    })
})

router.use('/file/download/uploads', express.static(conf.uploadDir));

/*
    owner: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    displayName: String,
    fileName:  { type: String, required: true },
    fileUrl: { type: String, required: true }
*/


/***********************************
 * EXPORTS
 ************************************/
//Export router
module.exports = router;
