const User = require("../models/user");
const bcrypt = require("bcryptjs");
const ValidationErrors = require("../Objects/ValidationErrors");
const UserObject = require("./User");

class AuthController {
    /**
     * Throws and PasswordError if password is not valid
     * @author Ravinder Shokar
     * @version 1.0 
     * @date Oct 11 2021
     * @param { String } password
     */
    static validatePassword(password) {
        const PASSWORD_REGEX = /^(?=.*\d{1,})(?=.*[a-z]{1,})(?=.*[A-Z]{1,})(?=.*[a-zA-Z]{1,}).{8,}$/;
        if (password !== undefined && !PASSWORD_REGEX.test(password)) {
            throw new ValidationErrors.PasswordError("Invalid Password");
        }
    }

    /**
     * Checks to see if an email is already in use.
     * @author Ravinder Shokar
     * @version 1.0 
     * @date Oct 11 2021
     * @param { String } email 
     */
    static doesEmailAlreadyExist(email) {
        return new Promise((res, rej) => {
            User.findOne({ email })
                .then(user => {
                    if (user) {
                        rej(new ValidationErrors.EmailError("Email is already in use"));
                    } else {
                        res();
                    }
                })
        })
    }

    /**
     * Regsiters a user. 
     * @author Ravinder Shokar
     * @version 1.0 
     * @date Oct 11 2021
     * @param { UserObject } userData 
     * @param { String } password 
     */
    static registerUser(userData, password) {
        return new Promise((res, rej) => {
            this.#hashPassword(password)
                .then(hashedPassword => {
                    let user = this.#newUserModel(userData, hashedPassword);
                    console.log(user);
                    res();
                    user.save()
                        .then(() => {
                            res()
                        })
                        .catch(e => {
                            rej(e);
                        })
                })
        })
    }

    /**
     * Returns a new Mongoose user model with data 
     * passed in
     * @author Ravinder Shokar
     * @version 1.0 
     * @date Oct 11 2021
     * @param { UserObject } user 
     * @return { User } mongoose model
     */
    static #newUserModel(user, password) {
        return new User({
            phone: user.phone,
            fName: user.fName,
            lName: user.lName,
            email: user.email,
            type: user.type,
            company: user.company,
            password,
        })
    }

    /**
     * Returns a hashed password 
     * @author Ravinder Shokar
     * @version 1.0 
     * @date Oct 11 2021
     * @param { String } password
     * @returns { String } hashed password.  
     */
    static #hashPassword(password) {
        return new Promise((res, rej) => {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, async (err, hashedPassword) => {
                    if (err) {
                        rej(new ValidationErrors.PasswordError("Invalid Password"))
                    } else {
                        res(hashedPassword);
                    }
                })
            })
        })
    }
}

module.exports = AuthController;