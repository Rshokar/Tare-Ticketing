const User = require("../models/user");
const bcrypt = require("bcryptjs");
const ValidationErrors = require("../Objects/ValidationErrors");
const UserObject = require("./User");

class AuthController {
    /**
     * @param { String } password
     */
    static validatePassword(password) {
        const PASSWORD_REGEX = /^(?=.*\d{1,})(?=.*[a-z]{1,})(?=.*[A-Z]{1,})(?=.*[a-zA-Z]{1,}).{8,}$/;
        if (password !== undefined && !PASSWORD_REGEX.test(password)) {
            throw new ValidationErrors.PasswordError("Invalid Password");
        }
    }

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
     * @param { UserObject } userData 
     * @param { String } password 
     * @returns 
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