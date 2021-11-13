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

class UserTypeError extends Error {
    constructor(message) {
        super(message);
        this.code = "type";
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

class ContractorNameError extends Error {
    constructor(message) {
        super(message);
        this.code = "contractor"
    }
}

class PasswordError extends Error {
    constructor(message) {
        super(message);
        this.code = "password"
    }
}

class DumpLocationError extends Error {
    constructor(message) {
        super(message);
        this.code = "dumpLocation";
    }
}

class LoadLocationError extends Error {
    constructor(message) {
        super(message);
        this.code = "loadLocation";
    }
}

class RecieverError extends Error {
    constructor(message) {
        super(message);
        this.code = "reciever";
    }
}

class SupplierError extends Error {
    constructor(message) {
        super(message);
        this.code = "supplier";
    }
}

class MaterialError extends Error {
    constructor(message) {
        super(message);
        this.code = "material";
    }
}

class NumTrucksError extends Error {
    constructor(message) {
        super(message);
        this.code = "numTrucks";
    }
}

class JWTVerificationError extends Error {
    constructor(message) {
        super(message);
        this.code = "JWT";
    }
}

class InvalidInputError extends Error { }

class SavingTicketsError extends Error {
    constructor(message, ids) {
        super(message);
        this.code = "save_ticket_error";
        this.ids = ids;
    }
}
module.exports = {
    NumTrucksError,
    PasswordError,
    CompanyNameError,
    PhoneError,
    EmailError,
    LastNameError,
    FirstNameError,
    JWTVerificationError,
    InvalidInputError,
    ContractorNameError,
    DumpLocationError,
    LoadLocationError,
    RecieverError,
    SupplierError,
    MaterialError,
    SavingTicketsError,
    UserTypeError,
};