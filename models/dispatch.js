
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const subModels = require("../models/subModels");


const operatorSchema = new Schema({
    id: { type: ObjectId, required: false, default: undefined },
    equipment: subModels.equipmentSchema,
    start: Date,
    name: String,
    status: String,
    jobId: ObjectId,
}, { _id: false })

const statusSchema = new Schema({
    empty: Number,
    sent: Number,
    confirmed: Number,
    active: Number,
    complete: Number,
}, { _id: false })


const dispatchSchema = new Schema({
    dispatcher: subModels.dispatcherSchema,
    operators: [operatorSchema],
    date: Date,
    dumpLocation: String,
    loadLocation: String,
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
