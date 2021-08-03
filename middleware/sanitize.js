const sanitize = require("mongo-sanitize");



const cleanQuery = (req, res, next) => {
    console.log("Hello");
    console.log({ ...req.body });
    req.query = deepSanitize({ ...req.body });
    console.log(req.body);
    next();

}

const deepSanitize = (value) => {
    if (Array.isArray(value)) {
        value.forEach(elm => deepSanitize(elm))
    }
    if (typeof (value) === 'object' && value !== null) {
        Object.values(value).forEach((elm) => {
            deepSanitize(elm)
        })
    }
    return sanitize(value)
}

module.exports = { cleanQuery }