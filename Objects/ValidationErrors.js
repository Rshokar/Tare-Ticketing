class FirstNameError extends Error {
    constructor(message) {
        super(message);
        this.code = "fName"
    }
}

class LastNameError extends Error {
    constructor(message) {
        super(message);
        this.code = "lName"
    }
}

class EmailError extends Error {
    constructor(message) {
        super(message);
        this.code = "email"
    }
}

class PhoneError extends Error {
    constructor(message) {
        super(message);
        this.code = "phone"
    }
}

class CompanyNameError extends Error {
    constructor(message) {
        super(message);
        this.code = "company"
    }
}

class PasswordError extends Error {
    constructor(message) {
        super(message);
        this.code = "password"
    }
}

class JWTVerificationError extends Error {
    constructor(message) {
        super(message);
        this.code = "JWT";
    }
}

class InvalidInputError extends Error { }


module.exports = {
    PasswordError,
    CompanyNameError,
    PhoneError,
    EmailError,
    LastNameError,
    FirstNameError,
    JWTVerificationError,
    InvalidInputError,
};