
const mongoose = require("mongoose");
const subModels = require("../models/subModels");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;

const operatorRates = new Schema({
    t: Number,
    t2p: Number,
    t3p: Number,
    t3tf: Number,
    t4tf: Number,
    t4ed: Number,
    tri: Number,
    tri2p: Number,
    tri3p: Number,
    tri3tf: Number,
    tri4tf: Number,
    tri4ed: Number,
    tonnage: Number,
    perLoad: Number,
})


const contractor = new Schema({
    billingAddress: subModels.billingAdress,
    contractorRates: subModels.hourSchema,
    operatorRates,
})


const userSchema = new Schema({
    fName: {
        type: String
    },
    lName: {
        type: String
    },
    phone: {
        type: String
    },
    company: {
        type: String
    },
    password: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    type: {
        type: String
    },
    employer: ObjectId,
    contractors: { contractor },
    address: subModels.billingAdress,
}, { timestamps: true })

const User = mongoose.model("User", userSchema);
module.exports = User;

