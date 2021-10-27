const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const subModels = require("../models/subModels");

const loadSchema = new Schema({
    loadTime: Date,
    dumpTime: Date,
    material: String,
    tonnage: Number,
    dumpLocation: String,
    loadLocation: String,
    type: String,
    status: String
}, { _id: false })


const jobSchema = new Schema({
    dispatchId: ObjectId,
    operator: ObjectId,
    date: Date,
    startTime: Date,
    finishTime: Date,
    startLocation: String,
    finishLocation: String,
    contractor: String,
    equipment: subModels.equipmentSchema,
    material: String,
    supplier: String,
    reciever: String,
    status: String,
    billingTickets: [loadSchema],
    rates: subModels.ratesSchema,
}, { timestamps: true })

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
