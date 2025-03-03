const jwt = require('jsonwebtoken')
const dbconfig = require('../config/database.config')
const errorFunction = require('../utills/error');

const auth = async (req, res, next) => {
    try {
        //  let result=req.url.startsWith('/LeafNetServer/api')
        const token = req.header('Authorization')
        const decoded = jwt.verify(token, dbconfig.Signature);
        if (decoded) {
            req.token = token
            req.user = decoded
            next();

        } else {
            let error = errorFunction('Invalid Token Authentication', 401, 'Unauthorize');
            res.status(401).send(error);
        }
    } catch (e) {
        let error = errorFunction('Invalid Token Authentication', 401, 'Unauthorize');
        res.status(401).send(error)
    }
}

module.exports = { auth }