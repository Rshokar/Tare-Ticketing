const Dispatch = require("../models/dispatch");
const User = require("../models/user");
const Job = require("../models/job");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");


const addRates = (req, res, next) => {
    const token = req.cookies.jwt;
    const contractor = req.body.contractor;

    if (contractor.length < 2) {
        res.send({
            status: "error",
            message: "Contractor name must be longer than two characters."
        })
        next();
    } else {
        jwt.verify(token, "butternut", (err, decodedToken) => {
            if (err) {
                res.send({
                    status: "error",
                    message: "Error decoding JWT token"
                })
            } else {
                User.findOne({ _id: decodedToken.id })
                    .then((user) => {

                        if (user.contractors == undefined) {
                            user.contractors = {};
                        }

                        if (user.contractors[contractor] != undefined) {
                            res.send({
                                status: "error",
                                message: "Contractor Already Exist."
                            })
                        } else {
                            user.contractors[contractor] = {
                                contractorRates: {
                                    t: 0,
                                    t2p: 0,
                                    t3p: 0,
                                    t3tf: 0,
                                    t4tf: 0,
                                    t4ed: 0,
                                    tri: 0,
                                    tri2p: 0,
                                    tri3p: 0,
                                    tri3tf: 0,
                                    tri4tf: 0,
                                    tri4ed: 0,
                                },
                                operatorRates: {
                                    tonnage: 0,
                                    perLoad: 0,
                                    t: 0,
                                    t2p: 0,
                                    t3p: 0,
                                    t3tf: 0,
                                    t4tf: 0,
                                    t4ed: 0,
                                    tri: 0,
                                    tri2p: 0,
                                    tri3p: 0,
                                    tri3tf: 0,
                                    tri4tf: 0,
                                    tri4ed: 0,
                                }
                            }
                            user.markModified("contractors");
                            user.save((err) => {
                                if (err) {
                                    res.send({
                                        status: "error",
                                        message: "Error Saving Contractor."
                                    })
                                } else {
                                    res.send({
                                        status: "success",
                                        message: "Contractor has been added."
                                    })
                                    next();
                                }
                            })
                        }
                    })
            }
        })
    }
}


module.exports = { addRates };