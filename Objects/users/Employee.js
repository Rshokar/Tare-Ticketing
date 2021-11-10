const UserObject = require("../users/User");
const User = require("../../models/user");

class EmployeeObject extends UserObject {
    constructor(args) {
        super(args);
        this.type = "employee";
        this.employer = args.employer;
    }

    /**
    * @author Ravinder Shokar
    * @version 1.0 
    * @date Oct 11 2021
    */
    validateUser() {
        const NAME_REGEX = /^[a-zA-Z]+$/;


        if (this.fName == "" || !this.fName) {
            throw new ValidationErrors.FirstNameError("First name cannot be left empty");
        } else if (this.fName.length < 3 || this.fName.length > 20) {
            throw new ValidationErrors.FirstNameError("First Name must be between 3 - 20 characters");
        } else if (!NAME_REGEX.test(this.fName)) {
            throw new ValidationErrors.FirstNameError("First Name cannot container numbers or special characters.");
        }

        if (this.lName == "" || !this.lName) {
            throw new ValidationErrors.LastNameError("Last name cannot be left empty");
        } else if (this.lName.length < 3 || this.lName.length > 20) {
            throw new ValidationErrors.LastNameError("Last Name must be between 3 - 20 characters");
        } else if (!NAME_REGEX.test(this.lName)) {
            throw new ValidationErrors.LastNameError("Last Name cannot container numbers or special characters.");
        }

        UserObject.validateEmail(this.email);


        if (!Number(this.phone)) {
            throw new ValidationErrors.PhoneError("Phone number must only contain digits.");
        } else if (this.phone.length < 10) {
            throw new ValidationErrors.PhoneError("Phone number is to short.");
        }
    }

    static getUserWithId(userId, employerId) {
        return new Promise(async res => {
            let employee = await super.getUserWithId(userId);
            employee.employer = employerId
            res(employee);
        })
    }
}

module.exports = EmployeeObject;