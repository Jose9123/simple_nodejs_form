var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        displayForm(res);
        // displayConfirmation(res);
    } else if (req.method.toLowerCase() == 'post') {
        //processAllFieldsOfTheForm(req, res);
        processFormFieldsIndividual(req, res);
        displayConfirmation(res);
    }
});

function displayForm(res) {
    fs.readFile('form.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

function processAllFieldsOfTheForm(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        //Store the data from the fields in your data store.
        //The data store could be a file or database or any other store based
        //on your application.
        res.writeHead(200, {
            'content-type': 'text/plain'
        });

        res.write('received the data:\n\n');
        res.end(util.inspect({
            fields: fields,
            files: files
        }));
        // displayConfirmation(res);
    });
}

function processFormFieldsIndividual(req, res) {
    //Store the data from the fields in your data store.
    //The data store could be a file or database or any other store based
    //on your application.
    var fields = [];
    var form = new formidable.IncomingForm();
    //Call back when each field in the form is parsed.
    form.on('field', function (field, value) {
        console.log(field);
        console.log(value);
        fields[field] = value;
    });
    //Call back when each file in the form is parsed.
    form.on('file', function (name, file) {
        console.log(name);
        console.log(file);
        fields[name] = file;
        //Storing the files meta in fields array.
        //Depending on the application you can process it accordingly.
    });

    //Call back for file upload progress.
    form.on('progress', function (bytesReceived, bytesExpected) {
        var progress = {
            type: 'progress',
            bytesReceived: bytesReceived,
            bytesExpected: bytesExpected
        };
        console.log(progress);
        //Logging the progress on console.
        //Depending on your application you can either send the progress to client
        //for some visual feedback or perform some other operation.
    });

    //Call back at the end of the form.
    form.on('end', function () {
//        res.writeHead(200, {
//            'content-type': 'text/plain'
//        });

//        res.write('received the data:\n\n');
//        res.end(util.inspect({
//            fields: fields
//        }));
        sendEmail(fields);
       
    });
    form.parse(req);
    
}

function displayConfirmation(res) {
    fs.readFile('confirmation.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

function sendEmail(formData){
    // console.log('sendEmail argument:' + formData);
    pic = formData.profilepic;

    // create reusable transporter object using the default SMTP transport
    //var transporter = nodemailer.createTransport('smtps://@smtp.gmail.com');

     var transporter = nodemailer.createTransport(smtpTransport({
         host: '172.20.8.31',
         port: 25
     }));
    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    // setup e-mail data with unicode symbols
    var htmlemail = '<b>Name: </b>'+ formData.fname + ' '+ formData.lname + 
                    '<br><b>Description: </b>'+ formData.description + 
                    '<br><b>URL: </b>' + formData.url + 
                    '<br><b>Other Contact: </b>' + formData.other_contact;
    var mailOptions = {
        from: 'Nodejs Form app ✔ <formapp@nodejsdev.local>', // sender address
        to: 'jose.montilla@gmail.com, jose.montilla@graduateschool.edu', // list of receivers
        subject: 'Website feedback form submission', // Subject line
        text: 'Hello world ✔', // plaintext body 
        html: htmlemail,
         attachments: [
            {   // file on disk as an attachment
                filename: pic.name,
                path: pic.path // stream this file
            }]
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}


//server.listen(3000, '10.0.2.15');
//console.log("server listening on 3000");
server.listen(8080, '127.0.0.1');
console.log("server listening on 8080");

