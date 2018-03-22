var bcrypt = require('bcrypt'),
    db = require('./pghelper'),
    config = require('./config'),
    uuid = require('node-uuid'),
    Q = require('q'),
    validator = require('validator'),
    winston = require('winston'),
  invalidCredentials = 'Invalid email or password';

/**
 * Encrypt password with per-user salt
 * @param password
 * @param callback
 */
function encryptPassword(password, callback) {
    winston.info('encryptPassword');
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return callback(err);
        }
        bcrypt.hash(password, salt, function (err, hash) {
            return callback(err, hash);
        });
    });
}

/**
 * Compare clear with hashed password
 * @param password
 * @param hash
 * @param callback
 */
function comparePassword(password, hash, callback) {
    winston.info('comparePassword');

    bcrypt.compare(password, hash, function (err, match) {
        if (err) {
            return callback(err);
        }
        return callback(null, match);
    });
}

/**
 * Create an access token
 * @param user
 * @returns {promise|*|Q.promise}
 */
function createAccessToken(user) {
    winston.info('createAccessToken');
    var token = uuid.v4(),
        deferred = Q.defer();
    
    db.query('INSERT INTO tokens (userId, externalUserId, token) VALUES ($1, $2, $3)', [user.id, user.externaluserid, token])
        .then(function() {
            deferred.resolve(token);
        })
        .catch(function(err) {
            deferred.reject(err);
        });
    return deferred.promise;
}

/**
 * Regular login with application credentials
 * @param req
 * @param res
 * @param next
 * @returns {*|ServerResponse}
 */
 
 
function mailgappformdetail(req, res, next) {
    var user = req.body;
     winston.info('mailgappformdetail post'+user.email);
    getmailgappformdetail(user.email)
        .then(function (mailgapformdata) {
        	//winston.info('mailgappformdetail data returned '+JSON.stringify(mailgapformdata));
            return res.send(JSON.stringify(mailgapformdata));
        })
        .catch(next);
};

function getmailgappformdetail(email) {
    winston.info('mailgappformdetail');

    console.log('user email is'+email);
    winston.info('mailgappformdetail user email'+email);
    return db.query('SELECT * from salesforce.contact WHERE email=$1 LIMIT 1', [email]);
//    db.query('SELECT * from salesforce.contact WHERE email=$1 LIMIT 1', [email],true, true)
//        .then(function (mailgapformdata) {
//        	console.log('mailgapp form data is'+JSON.stringify(mailgapformdata))
//        	winston.info('mailgappformdetail data returned '+JSON.stringify(mailgapformdata));
//        	return res.send(JSON.stringify(mailgapformdata));
//            
//        })
//        .catch(next);
};


// method to ge the rs addendum details starts
function rsaddendumdetail(req, res, next) {
    var user = req.body;
     winston.info('rsaddendumdetail post'+user.email);
    getrsaddendumdetail(user.email)
        .then(function (rsaddendumformdata) {
        	//winston.info('rsaddendumdetail data returned '+JSON.stringify(rsaddendumformdata));
            return res.send(JSON.stringify(rsaddendumformdata));
        })
        .catch(next);
};

function getrsaddendumdetail(email) {
    winston.info('rsaddendumdetail');

    console.log(' rsaddendum user email is'+email);
    winston.info('rsaddendumdetail user email'+email);
    return db.query('SELECT * from salesforce.Mailgapp_Addendum__c WHERE Email_Address__c=$1 LIMIT 1', [email]);

};
// method to get the rs addendum ends


// method to ge the rs agreement details starts
function rsagreementdetail(req, res, next) {
    var user = req.body;
     winston.info('rsagreementdetail post'+user.email);
    getrsagreementdetail(user.email)
        .then(function (rsagreementformdata) {
        	//winston.info('rsaddendumdetail data returned '+JSON.stringify(rsaddendumformdata));
            return res.send(JSON.stringify(rsagreementformdata));
        })
        .catch(next);
};

function getrsagreementdetail(email) {
    winston.info('rsagreementdetail');

    console.log(' rsagreement user email is'+email);
    winston.info('rsagreementdetail user email'+email);
    return db.query('SELECT * from salesforce.Mailgapp_Service_Agreement__c WHERE MG_Email_Address__c=$1 LIMIT 1', [email]);

};
// method to get the rs agreement ends


/**
 * Logout user
 * @param req
 * @param res
 * @param next
 */
function logout(req, res, next) {
    winston.info('logout');
    var token = req.headers['authorization'];
    winston.info('Logout token:' + token);
    db.query('DELETE FROM tokens WHERE token = $1', [token])
        .then(function () {
            winston.info('Logout successful');
            res.send('OK');
        })
        .catch(next);
};

/**
 * Signup
 * @param req
 * @param res
 * @param next
 * @returns {*|ServerResponse}
 */
function mailgapp(req, res, next) {

   // winston.info('mailgapform method called');
    //console.log('mailgapform method called')

    var mailgapform = req.body;
    var user=mailgapform.user;
	//winston.info('mailgapform data is'+mailgapform+" usermail"+user);
	//console.log('mailgapform data is'+mailgapform)

        var deferred = Q.defer(),
        externalUserId = (+new Date()).toString(36); // TODO: more robust UID logic
        db.query('Update salesforce.contact set MG_Date__c=$1,FirstName=$2,MailingStreet=$3,MailingCity=$4,MailingState=$5,MailingPostalCode=$6,MG_Name__c=$7,OtherStreet=$8,'+
			  'OtherCity=$9,OtherState=$10, OtherPostalCode=$11, MG_Applicant_Name__c=$12,MG_Applicant_Address__c=$13,MG_Applicant_City__c=$14,MG_Applicant_State__c=$15,'+
			  'MG_Applicant_Zipcode__c=$16,MG_Applicant_Phone__c=$17,MG_IdentityProof1__c=$18,MG_IdentityProof2__c=$19,MG_Company_Name__c=$20,MG_Business_Address__c=$21,MG_Business_Address_City__c=$22,'+
			  'MG_Business_Address_State__c=$23,MG_Business_Address_Zip__c=$24,MG_Business_TelephneNo__c=$25,MG_Business_Type__c=$26,MG_IsFormFilled__c=$27,MG_Applicant_Signature__c=$29,Restricted_Delivery_Signature__c=$30 WHERE email=$28',
			  [mailgapform.date,mailgapform.Name,mailgapform.deliveryaddress,mailgapform.deliverycity,mailgapform.deliverystate,mailgapform.deliveryzipcode,mailgapform.authorizedname,
			   mailgapform.authorizedaddress,mailgapform.authorizedcity,mailgapform.authorizedstate,mailgapform.authorizedzipcode,mailgapform.applicantname,mailgapform.applicantaddress,
			   mailgapform.applicantcity,mailgapform.applicantstate,mailgapform.applicantzipcode,mailgapform.applicanttelephone,
			   mailgapform.proofA,mailgapform.proofB,mailgapform.businessname,mailgapform.businessaddress,mailgapform.businesscity,mailgapform.businessstate,mailgapform.businesszipcode,mailgapform.businesstelephone,
			   mailgapform.businesstype,true,user,mailgapform.signatureDataurl,mailgapform.restrictedSignatureDataurl
			  ],true)
        .then(function () {
        	console.log('data inserted success');
            	return res.send('OK');
        })
        .catch(function(err) {
        	console.log('data inserted error'+err)
            deferred.reject(err);
        });

     //db.query('INSERT INTO salesforce.contact (MG_Date__c,FirstName,MailingStreet,MailingCity,MailingState,MailingPostalCode,MG_Name__c,OtherStreet,'+
			  //'OtherCity,OtherState, OtherPostalCode, MG_Applicant_Name__c,MG_Applicant_Address__c,MG_Applicant_City__c,MG_Applicant_State__c,'+
			  //'MG_Applicant_Zipcode__c,MG_Applicant_Phone__c,MG_IdentityProof1__c,MG_IdentityProof2__c,MG_Company_Name__c,MG_Business_Address__c,MG_Business_Address_City__c,'+
			  //'MG_Business_Address_State__c,MG_Business_Address_Zip__c,MG_Business_TelephneNo__c,MG_Business_Type__c,MG_IsFormFilled__c)'+ 
			  //'VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)', 
			  //[mailgapform.date,mailgapform.Name,mailgapform.deliveryaddress,mailgapform.deliverycity,mailgapform.deliverystate,mailgapform.deliveryzipcode,mailgapform.authorizedname,
			  // mailgapform.authorizedaddress,mailgapform.authorizedcity,mailgapform.authorizedstate,mailgapform.authorizedzipcode,mailgapform.applicantname,mailgapform.applicantaddress,
			  // mailgapform.applicantcity,mailgapform.applicantstate,mailgapform.applicantzipcode,mailgapform.applicanttelephone,
			  // mailgapform.proofA,mailgapform.proofB,mailgapform.businessname,mailgapform.businessaddress,mailgapform.businesscity,mailgapform.businessstate,mailgapform.businesszipcode,mailgapform.businesstelephone,
			  // mailgapform.businesstype,true
			  //],true)
			  //.then(function (insertedData) {
        //     deferred.resolve(insertedData);
        //     console.log('data inserted success');
        //     return res.send('OK');
        // })
        // .catch(function(err) {
        // 	console.log('data inserted error'+err)
        //     deferred.reject(err);
        // });
    return deferred.promise;
};

/*
file upload method in the salesforce attachment object
*/
function fileupload(req, res, next) {
   winston.info('fileupload method called');
   var filedata = req.body;
   
   winston.info('filedata is'+filedata.filename+" type"+filedata.filetype+" sfid"+filedata.sfid);
   
   var deferred = Q.defer(),
        externalUserId = (+new Date()).toString(36); // TODO: more robust UID logic
        db.query('INSERT INTO salesforce.attachment (Name,parentid,contenttype,body,description) VALUES ($1, $2, $3, $4, $5)', 
			  [filedata.filename,filedata.sfid,filedata.filetype,filedata.base64URL,'Uploaded from mailgapp app'],true)
			  .then(function (insertedData) {
            deferred.resolve(insertedData);
            console.log('data inserted success');
            return res.send('OK');
        })
        .catch(function(err) {
        	console.log('data inserted error'+err)
            deferred.reject(err);
        });
};

/**
 * Create a user
 * @param user
 * @param password
 * @returns {promise|*|Q.promise}
 */
function createUser(user, password) {

    var deferred = Q.defer(),
        externalUserId = (+new Date()).toString(36); // TODO: more robust UID logic

    db.query('INSERT INTO salesforce.contact (email, password__c, firstname, lastname, leadsource, loyaltyid__c, accountid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, firstName, lastName, email, loyaltyid__c as externalUserId',
        [user.email, password, user.firstName, user.lastName, 'Loyalty App', externalUserId, config.contactsAccountId], true)
        .then(function (insertedUser) {
            deferred.resolve(insertedUser);
        })
        .catch(function(err) {
            deferred.reject(err);
        });
    return deferred.promise;
};

/**
 * Validate authorization token
 * @param req
 * @param res
 * @param next
 * @returns {*|ServerResponse}
 */
function validateToken (req, res, next) {
    var token = req.headers['authorization'];
    if (!token) {
        token = req.session['token']; // Allow token to be passed in session cookie
    }
    if (!token) {
        winston.info('No token provided');
        return res.send(401, 'Invalid token');
    }
    db.query('SELECT * FROM tokens WHERE token = $1', [token], true, true)
        .then(function (item) {
            if (!item) {
                winston.info('Invalid token');
                return res.send(401, 'Invalid token');
            }
            req.userId = item.userid;
            req.externalUserId = item.externaluserid;
            return next();
        })
        .catch(next);
};

exports.mailgappformdetail = mailgappformdetail;
exports.logout = logout;
exports.fileupload=fileupload;
exports.mailgapp = mailgapp;
exports.createUser = createUser;
exports.createAccessToken = createAccessToken;
exports.validateToken = validateToken;
exports.rsaddendumdetail = rsaddendumdetail;
exports.getrsaddendumdetail = getrsaddendumdetail;
exports.rsagreementdetail = rsagreementdetail;
exports.getrsagreementdetail = getrsagreementdetail;
