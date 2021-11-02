
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const subModels = require("../models/subModels");


const statusSchema = new Schema({
    empty: Number,
    sent: Number,
    confirmed: Number,
    active: Number,
    complete: Number,
}, { _id: false })


const dispatchSchema = new Schema({
    dispatcher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: Date,
    dumpLocation: String,
    startLocation: String,
    contractor: String,
    numTrucks: Number,
    notes: String,
    material: String,
    supplier: String,
    reciever: String,
    status: statusSchema,
    rates: subModels.ratesSchema,
}, { timestamps: true })

const Dispatch = mongoose.model("Dispatch", dispatchSchema);
module.exports = Dispatch;
