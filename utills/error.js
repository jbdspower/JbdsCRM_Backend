module.exports = function (message, code, type) {
    let errorDesc = {
        message: message,
        code: code,
        type: type,
        timeCreated: new Date()
    };
    return errorDesc;
};
