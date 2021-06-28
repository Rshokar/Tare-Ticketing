
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dispatchSchema = new Schema({
    dispatcher: {
        type: Object
    },
    operators: {
        type: Array
    },
    date: {
        type: String
    },
    dumpLocation: {
        type: String
    },
    loadLocation: {
        type: String
    },
    contractor: {
        type: String,
    },
    numTrucks: {
        type: Number
    },
    notes: {
        type: String
    },
    material: {
        type: String
    },
    supplier: {
        type: String
    },
    reciever: {
        type: String
    },
    status: {
        type: Object
    }
}, { timestamps: true })

const Dispatch = mongoose.model("Dispatch", dispatchSchema);
module.exports = Dispatch;
