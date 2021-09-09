const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const routeSchema = new Schema({
    r: Number,
    d: String,
    l: String
}, { _id: false })

const hourSchema = new Schema({
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
}, { _id: false })

const routesSchema = new Schema({
    fee: Number,
    rates: [routeSchema],
}, { _id: false })

const hourlySchema = new Schema({
    cont: hourSchema,
    oper: hourSchema,
}, { _id: false })

const ratesSchema = new Schema({
    hourly: hourlySchema,
    tonnage: routesSchema,
    perLoad: routesSchema
}, { _id: false })

const dispatcherSchema = new Schema({
    id: ObjectId,
    company: String
}, { _id: false })

const equipmentSchema = new Schema({
    trailer: String,
    truck: String,
}, { _id: false })

const operatorSchema = new Schema({
    id: ObjectId,
    name: String
}, { _id: false })

const billingAdress = new Schema({
    address: String,
    country: String,
    province: String,
    city: String,
    postal: String,
}, { _id: false })

module.exports = {
    hourSchema,
    ratesSchema,
    dispatcherSchema,
    equipmentSchema,
    operatorSchema,
    billingAdress
}