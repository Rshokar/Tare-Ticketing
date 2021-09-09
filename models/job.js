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
    dispatcher: subModels.dispatcherSchema,
    dispatchTicket: ObjectId,
    operator: subModels.operatorSchema,
    date: Date,
    start: Date,
    finish: Date,
    dumpLocation: String,
    loadLocation: String,
    contractor: String,
    equipment: subModels.equipmentSchema,
    notes: String,
    material: String,
    supplier: String,
    reciever: String,
    status: String,
    loadTickets: [loadSchema],
    rates: subModels.ratesSchema,
}, { timestamps: true })

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
