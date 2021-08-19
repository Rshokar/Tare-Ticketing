const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
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

const inovoiceSchema = new Schema({
    lastIndex: Number,
    total: Number,
    user: ObjectId,
    customer: String,
    dateRange: dateRangeSchema,
    i: [rowSchema]
})

const Invoice = mongoose.model("Invoice", inovoiceSchema);
module.exports = Invoice;




