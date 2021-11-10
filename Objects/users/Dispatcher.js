const UserObject = require("../users/User");
const ValidationErrors = require("../ValidationErrors");
const User = require("../../models/user");

class DispatcherObject extends UserObject {
    constructor(args) {
        super(args);
        this.employer = args.employer;
    }

    static async getEmployees(id) {
        return new Promise(res => {
            User.find({ employer: id })
                .then(employees => {
                    if (employees) {
                        res(employees);
                    } else {
                        res(undefined);
                    }
                })
        })
    }


    static #getEmpsFromlistOfIds(ids) {
        return new Promise(res => {
            User.find({ _id: { $in: ids } })
                .then(employees => {
                    if (employees) {
                        res(employees);
                    } else {
                        res(undefined);
                    }
                })
        })
    }
}

module.exports = DispatcherObject;