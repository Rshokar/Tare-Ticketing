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
    dispatch: { type: mongoose.Schema.Types.ObjectId, ref: "Dispatch", },
    operator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    date: Date,
    startTime: Date,
    finishTime: Date,
    startLocation: String,
    finishLocation: String,
    contractor: String,
    equipment: { type: subModels.equipmentSchema, required: true },
    material: String,
    supplier: String,
    reciever: String,
    status: { type: String, required: true },
    billingTickets: [loadSchema],
    rates: subModels.ratesSchema,
}, { timestamps: true })

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
