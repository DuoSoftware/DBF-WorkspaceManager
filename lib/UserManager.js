/**
 * Created by vmkde on 5/31/2018.
 */


const messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
const users = require('dbf-dbmodels/Models/RolesAndGroups').user;
const mongoose = require("mongoose");




module.exports.GetUserByEmailInternal = function(req, res){

    console.log("DBF-Services.GetUserByEmail Internal method ");

    let Schema = mongoose.Schema;
    let ObjectId = Schema.ObjectId;

    let company = req.user.company;
    let tenant = req.user.tenant;
    let email = req.user.iss;
    let jsonString;


    users.findOne({email:email, company:company,tenant:tenant},function (err, _users) {
        if(err)
        {
            jsonString=messageFormatter.FormatMessage(err, "GetUserByEmail failed", false, undefined);
        }
        else
        {
            jsonString=messageFormatter.FormatMessage(undefined, "GetUserByEmail succeeded", true, _users);
        }
        res(jsonString);
    });

};