const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSchema = new Schema({
    dispatcher: {
        type: Object
    },
    dispatchTicket: {
        type: String
    },
    operator: {
        type: Object
    },
    date: {
        type: String
    },
    startTime: {
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
    equipment: {
        type: Object
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
        type: String
    }
}, { timestamps: true })

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
