require('dotenv').config();
var jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const token = req.body.token;
    if (token == null || token == '') {
        res.status(401).json({ 'error': "Not authenticated."});
        return
    }

    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) res.status(401).json({ 'error': "Not authenticated."});
        next();
        return;
    });
}

module.exports = {
    authenticate
}