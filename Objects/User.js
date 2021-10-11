const ValidationErrors = require("../Objects/ValidationErrors");

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

    validateUser() {
        const NAME_REGEX = /^[a-zA-Z]+$/;
        const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

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


        if (!(EMAIL_REGEX.test(this.email))) {
            throw new ValidationErrors.EmailError("Invalid Email");
        }

        if (!Number(this.phone)) {
            throw new ValidationErrors.PhoneError("Phone number must only contain digits.");
        } else if (this.phone.length < 10) {
            throw new ValidationErrors.PhoneError("Phone number is to short.");
        }

        if (this.company == "" || !this.company) {
            throw new ValidationErrors.CompanyNameError("Company Name cannot be left empty");
        } else if (this.company.length < 3 || this.company.length > 20) {
            throw new ValidationErrors.CompanyNameError("Company Name must be between 3 - 20 characters");
        } else if (!NAME_REGEX.test(this.company)) {
            throw new ValidationErrors.CompanyNameError("Company Name cannot container numbers or special characters.");
        }
    }
}



module.exports = UserObject;