
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fName: {
        type: String
    },
    lName: {
        type: String
    },
    phone: {
        type: String
    },
    company: {
        type: String
    },
    password: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    type: {
        type: String
    },
    employees: {
        type: Array
    },
    contractors: {
        type: Object
    }
}, { timestamps: true })

const User = mongoose.model("User", userSchema);
module.exports = User;

