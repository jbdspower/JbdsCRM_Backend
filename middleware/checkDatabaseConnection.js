const CheckDbConnection = (req, res, next) => {
    try {
        next();
        // let connectionString = "mongodb+srv://leafnet-db-user:leafnet-db-user@leafnet.ycemx.mongodb.net/" + dbOptions.DatabaseName + "?retryWrites=true&w=majority"
        //  mongoose.createConnection(connectionString, dbOptions.Options, function (err, conn) {
        //     if (err) {
        //         res.status(401).send({ message: 'database not connected' });
        //     }
        //     else {
        //         next();
        //     }
        // });
    } catch (e) {
        console.log('database not connected');
        res.status(401).send({ message: 'database not connected' });
    }
}
module.exports = CheckDbConnection
