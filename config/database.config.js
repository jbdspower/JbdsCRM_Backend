module.exports = {
    AppName: 'LeafNetServer',
    DatabaseName: "LeafNetAdminDb",
    // DatabaseName:"CRMDatabase",
    url:"mongodb://localhost:27017/",
    //  url: "mongodb+srv://sandy:VS8rzQ6Nopt9Jjvm@cluster0.nwyas.mongodb.net/",
    ServerType: "Shared",
    Version: "2.2",
    Options: {
        // user: "saffronlogics",
        // pass: "scigolnorffas",
        poolSize: 10,
        keepAlive: 3000000,
        keepAliveInitialDelay: 300000,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        //autoIndex: false    
    },
    Signature: "BOxvIH7TM7M3vJyYKPsZQnlWP2H_yLucSbGkFpau2lL9IzcRMOho-uND3KiMGhuKdsg"
}