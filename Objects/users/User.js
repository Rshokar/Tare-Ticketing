const ValidationErrors = require("../ValidationErrors");
const User = require("../../models/user");

class UserObject {
    constructor(args) {
        if (args) {
            this.phone = args.phone;
            this.fName = args.fName;
            this.lName = args.lName;
            this.email = args.email;
            this.type = args.type;
            this.company = args.company;
        }
    }

    /**
    * @author Ravinder Shokar
    * @version 1.0 
    * @date Oct 11 2021
    */
    validateUser() {
        const NAME_REGEX = /^[a-zA-Z]+$/;
        const COMPANY_REGEX = /^[a-zA-Z]+$/;

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

        if (this.company == "" || !this.company) {
            throw new ValidationErrors.CompanyNameError("Company Name cannot be left empty");
        } else if (this.company.length < 3 || this.company.length > 20) {
            throw new ValidationErrors.CompanyNameError("Company Name must be between 3 - 20 characters");
        }
        // else if (!NAME_REGEX.test(this.company)) {
        //     throw new ValidationErrors.CompanyNameError("Company Name cannot containe numbers or special characters.");
        // }
    }


    static validateEmail(email) {
        const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!(EMAIL_REGEX.test(email))) {
            throw new ValidationErrors.EmailError("Invalid Email");
        }
    }


    /**
     * Get a user with a specific email
     * @param { String } email 
     * @return { User } returns user if succesful otherwise undefined.
     */
    static getUserWithEmail(email) {
        return new Promise((res) => {
            User.findOne({ email: email })
                .then(user => {
                    if (user) {
                        res(user);
                    } else {
                        res(undefined);
                    }
                })
        })
    }

    /**
    * Get a user with a specific Id
    * @param { String } id 
    * @return { User } returns user if succesful otherwise undefined.
    */
    static getUserWithId(id) {
        return new Promise((res) => {
            User.findOne({ _id: id })
                .then(user => {
                    if (user) {
                        res(user);
                    } else {
                        res(undefined);
                    }
                })
        })
    }
    /**
     * Saves a user to DB
     * @param { UserObject } user 
     * @returns 
     */
    static saveUser(user) {
        return new Promise((res, rej) => {

        })
    }

    static deleteUserUsingModel(model) {
        return new Promise((res, rej) => {
            User.deleteOne({
                _id: model.id
            })
                .then(() => {
                    res();
                })
                .catch(() => {
                    rej();
                })
        })
    }
}



module.exports = UserObject;