const jwt = require('jsonwebtoken');


authenticate = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'butternut', (err, decodedToken) => {
            if (err) {
                res.redirect('/login');
            } else {
                next();
            }
        })
    } else {
        res.redirect('/login');
    }
}

module.exports = authenticate
