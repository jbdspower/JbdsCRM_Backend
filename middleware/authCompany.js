let dbConfig = require('../config/database.config');



const authCompany = async (req, res, next) => {
    try {
        // let model = await client.getModel(dbConfig.DatabaseName);
        // let companyName = req.header('Company');
        // let clienDoc = await model.findOne({ Company: companyName })
        // if (!clienDoc) {
        //     res.status(401).send({ message: 'Company Not Found ' })
        // } else {
        //     if (clienDoc.CurrentStatus == 'Active') {
        //         if (new Date(clienDoc.ServiceValidTill) >= new Date(Date.now())) {
        //             if (clienDoc['ServerType'] == undefined || clienDoc['ServerType'] == dbConfig.ServerType) {
        //                 req.DbName = clienDoc.DbName;
        //                 req.id = req.header('id');
        //                 req.Company = req.header('Company');
        //                 next();
        //             }
        //             else {
        //                 res.status(401).send({ message: 'Access to company denied ' })
        //             }
        //         } else {
        //             res.status(401).send({ message: 'Company Service Not Valid' })
        //         }

        //     } else {
        //         res.status(401).send({ message: 'Company not active' })
        //     }


        // }
        // req.DbName="CRMDatabase"
        // req.Company="CRM"
        next()
    } catch (e) {
        res.status(401).send({ message: 'Company Not Found ' })
    }
}

module.exports = authCompany
