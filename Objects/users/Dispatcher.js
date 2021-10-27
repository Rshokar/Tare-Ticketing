const UserObject = require("../users/User");
const ValidationErrors = require("../ValidationErrors");
const User = require("../../models/user");

class DispatcherObject extends UserObject {
    constructor(args) {
        super(args);
        this.employer = args.employer;
    }

    /**
     * Adds a employee to a dispatcher document
     * @param { String } id Dispatcher id
     * @param { EmployeeObject } employee  
     */
    static addEmployee(id, employee) {
        return new Promise(async (res, rej) => {
            let dispatcher;
            const EMPLOYEE = "employee";
            if (employee.type != EMPLOYEE) {
                rej(new ValidationErrors.InvalidInputError());
            } else {
                dispatcher = await UserObject.getUserWithId(id);
                // console.log(dispatcher);
                console.log(employee);
                if (!dispatcher) {
                    rej(new ValidationErrors.InvalidInputError());
                }
                dispatcher.employees.push(employee.id);
                dispatcher.markModified("employees");
                dispatcher.save();
                res();
            }
        })
    }

    static async getEmployees(id) {
        let dispatcher = await UserObject.getUserWithId(id);
        let employees = await DispatcherObject.#getEmpsFromlistOfIds(dispatcher.employees);
        return employees;
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