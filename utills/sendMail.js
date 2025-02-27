
let nodeMailer = require('nodemailer');
const AWS = require("aws-sdk");
// const config = require('../config/aws.config.json');
let nodeMail = module.exports = {}

nodeMail.SendMail = function SendMail(user, callback) {

  // AWS.config.update({
  //   accessKeyId: config.AWS_SES.accessKeyId,
  //   secretAccessKey: config.AWS_SES.secretAccessKey,
  //   region: config.AWS_SES.region
  // });

  const ses = new AWS.SES({ apiVersion: "2010-12-01" });
  const params = {
    Destination: {
      ToAddresses: [user.email] // Email address/addresses that you want to send your email
    },
    Message: {
      Body: {
        Html: {
          // HTML Format of the email
          Charset: "UTF-8",
          Data:
            "<html><body>" + "Dear ,  <br></br>" + user.name + "  <br></br><br></br>  <b>Email: </b>" + user.email + "  <br></br>   <b>Password: </b>  " + user.password + "   <br></br>    <b>Company:  </b> " + user.company + "</body></html>"
        },
        Text: {
          Charset: "UTF-8",
          Data: 'Dear  ,   ' + user.name + "      Your login Credentials for www.leafnet.cc"
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Leafnet Login Credentials`
      }
    },
    // Source: "Leafnet" + config.AWS_SES.SenderEmailId
  };

  //For Sender
  const params1 = {
    Destination: {
      // ToAddresses: [config.AWS_SES.SenderEmailId] // Email address/addresses that you want to send your email
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: "<html><body>" + "Report From Leafnet Feedback Message ,  <br></br>" + user.name + "  <br></br><br></br>  <b>Email: </b>" + user.email + "  <br></br>   <b>Password: </b>  " + user.password + "   <br></br>    <b>Company:  </b> " + user.company + "</body></html>"
        },
        Text: {
          Charset: "UTF-8",
          Data: "This is the feedback message from user"
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Feedback from " + user.name
      }
    },
    // Source: "Feedback from user" + config.AWS_SES.SenderEmailId
  };

  const sendEmailReceiver = ses.sendEmail(params).promise();
  const sendEmailSender = ses.sendEmail(params1).promise();

  sendEmailReceiver
    .then(data => {
      console.log("email submitted to SES", data);
      sendEmailSender.then(data => {
        console.log("email submitted to SES", data);
        callback(null, data);

      }).catch(error => {
        callback(error, null)

      });
    })
    .catch(error => {
      callback(error, null)

    });
}

nodeMail.sendMailForTesting = async function sendMailForTesting(user, message) {
  // try {
  //   AWS.config.update({
  //     accessKeyId: config.AWS_SES.accessKeyId,
  //     secretAccessKey: config.AWS_SES.secretAccessKey,
  //     region: config.AWS_SES.region
  //   });

  //   const transporter = nodeMailer.createTransport({ SES: new AWS.SES({ apiVersion: '2010-12-01' }) });
  //   const mailOptions = {
  //     from: config.AWS_SES.SenderEmailId,
  //     to: user,
  //     subject: 'PM Due',
  //     text: message
  //   };

  //   let sendMail = await transporter.sendMail(mailOptions);
  //   console.log('Email sent successfully:', sendMail.envelope.to);
  //   return sendMail;

  // } catch (err) {
  //   throw err;
  // }
}

