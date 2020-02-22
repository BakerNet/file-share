const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");


/***************************************************************************
 * USER SCHEMA
 ***************************************************************************/

//Schema for user object in MongoDB
var fileSchema = mongoose.Schema({
    owner: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    displayName: String,
    fileName:  { type: String, required: true },
    fileUrl: { type: String, required: true },
    accessGranted: [ { type: String } ]
});

/***************************************************************************
 * USER SCHEMA FUNCTIONS
 ***************************************************************************/

//Do nothing function
var noop = function() {};

/***************************************************************************
 * USER METHODS
 ***************************************************************************/

//Get user name
fileSchema.methods.name = function(){
    return this.displayName || this.fileName;
};

/***************************************************************************
 * EXPORTS
 ***************************************************************************/

var File = mongoose.model("File", fileSchema)

module.exports = File;