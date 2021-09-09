const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const subModels = require("../models/subModels");
const Schema = mongoose.Schema;

const dateRangeSchema = new Schema({
    start: Date,
    finish: Date,
}, { _id: false })

const rowSchema = new Schema({
    truck: String,
    load: String,
    dump: String,
    rate: Number,
    amount: Number,
    total: Number,
    date: String,
}, { _id: false })

const nameBilling = new Schema({
    id: ObjectId,
    name: String,
    billingAddress: subModels.billingAdress,
}, { id: false })

const inovoiceSchema = new Schema({
    lastIndex: Number,
    total: Number,
    user: nameBilling,
    customer: nameBilling,
    dateRange: dateRangeSchema,
    i: [rowSchema]
})

const Invoice = mongoose.model("Invoice", inovoiceSchema);
module.exports = Invoice;




