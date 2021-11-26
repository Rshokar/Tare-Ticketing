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


    static getEmpsFromlistOfIds(ids) {
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

    static isValidContractor(contractor, userId) {
        return new Promise(async (res, rej) => {
            if (!contractor || !userId) {
                rej(new ValidationErrors.InvalidInputError("Passed in undefined value."));
            } else {
                let dispatcher = await UserObject.getUserWithId(userId);
                if (!dispatcher) {
                    rej(new ValidationErrors.InvalidInputError("No user found with id passed in."));
                }
                if (dispatcher._doc.contractors[contractor]) { res() }
                rej(new ValidationErrors.ContractorNameError("Invalid Contractor."));
            }
        })
    }
}

module.exports = DispatcherObject;