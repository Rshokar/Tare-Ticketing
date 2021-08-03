const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dateRangeSchema = new Schema({
    start: Date,
    finish: Date,
}, { _id: false })

const rowSchema = new Schema({
    operator: String,
    load: String,
    dump: String,
    rate: Number,
    qty: Number,
    total: Number,
}, { _id: false })

const inovoiceSchema = new Schema({
    lastIndex: Number,
    user: ObjectId,
    customer: String,
    dateRange: dateRangeSchema,
    i: [rowSchema]
})

const Invoice = mongoose.model("Invoice", inovoiceSchema);
module.exports = Invoice;




