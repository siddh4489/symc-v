var db = require('./pghelper'),
	nforce = require('nforce'),
	Q = require('q'),
	config = require('./config'),
	winston = require('winston');

function findAll(limit) {
    return db.query("SELECT id, sfId, name, startDate, endDate, description, image__c AS image, campaignPage__c AS campaignPage, publishDate__c AS publishDate FROM salesforce.campaign WHERE type='Offer' AND status='In Progress' ORDER BY publishDate DESC LIMIT $1", [limit]);
};

function findById(id) {
    // Retrieve offer either by Salesforce id or Postgress id
    return db.query('SELECT id, sfId, name, startDate, endDate, description, image__c AS image, campaignPage__c AS campaignPage, publishDate__c AS publishDate FROM salesforce.campaign WHERE ' + (isNaN(id) ? 'sfId' : 'id') + '=$1', [id], true);
};

function getAll(req, res, next) {
    findAll(20)
        .then(function (offers) {
            console.log(JSON.stringify(offers));
            return res.send(JSON.stringify(offers));
        })
        .catch(next);
};

function findAttachmentById(id){
	return db.query('select Id,Name,ContentType,bodylength,body,sfid from salesforce.Attachment WHERE ' + (isNaN(id) ? 'Id' : 'id') + '=$1', [id], true);	
};

function getAttachmentById(req, res, next){
	var id = req.params.id;
    findAttachmentById(id)
        .then(function (attachment) {
            //console.log(JSON.stringify(attachment));
            //console.log('attch body'+attachment.body);
     //       var fs = require('fs');
	    //var dir = './download';
	    //if (!fs.existsSync(dir)){
	    //	try{
	    //	    fs.mkdirSync(dir);
	    //	    fs.writeFile("/download/mailgapp.pdf", new Buffer(attachment.body, "base64").toString(),
	    //	    	function(err) {
	    //	    		console.log('error creating file');
	    //	    	});
	    //	    console.log('folder created');		
	    //	}catch(e){
	    //	    console.log('error folder created'+e);	
	    //	}
     //       }	
            //var buff = new Buffer(JSON.stringify(attachment.body).toString("base64");
            //console.log('attachment body'+buff)
            //return res.send(buff);
            //return res.send(JSON.stringify(attachment));
           // var blob = new Blob({'Id': attachment.id, 'name': attachment.name, 'body': attachment.body,'contenttype':attachment.contenttype});
            //return res.send(attachment);
            //return res.send({'Id': attachment.id, 'name': attachment.name, 'body': attachment.body,'contenttype':attachment.contenttype});
	   var decodedBuffer = new Buffer(attachment.body,"base64");            
    //		res.send({
    //      		code: 200,
    //      		headers: {'Content-Type': 'image/png', 'Content-Length': decodedBuffer.length},   
    //      		noEnd: true                               
    //		});     

    //		res.write("data:application/pdf;base64,"+decodedBuffer);                       
    //		res.end(); 
	  //var jsfile = new Buffer.concat(chunks).toString('base64');
          //console.log('converted to base64');
          //res.header("Access-Control-Allow-Origin", "*");
          //res.header("Access-Control-Allow-Headers", "X-Requested-With");
          //res.header('content-type', 'application/pdf');
          //res.write("data:application/pdf;base64,"+decodedBuffer);
          res.send(decodedBuffer);    		
	    
        })
        .catch(next);
};


function getAttachmentDetail(req, res, next){
	var id = req.params.id;
    findAttachmentById(id)
        .then(function (attachment) {
            //console.log(JSON.stringify(attachment));
            return res.send({'Id': attachment.id, 'name': attachment.name,'contenttype':attachment.contenttype,'sfid':attachment.sfid});
        })
        .catch(next);
};


function getAllAttachments(userid){
	console.log('in getallattachments');
	return db.query('select Id,sfid,Name,ContentType,parentId,bodylength from salesforce.Attachment where ContentType=$1 and parentId=$2',['application/pdf',userid]);
};

function getAllAttachmentsForCourier(req,res,next){
	var id=req.params.id;
	console.log('sfid'+id);
	
	getAllAttachments(id).
	then(function(attachments){
		console.log('attachments method called');
//		console.log('attachments'+JSON.stringify(attachments));
//		winston.info('attachments data returned '+JSON.stringify(attachments));
		return res.send(JSON.stringify(attachments));
	}).catch(next);
};

function getUserDetails(userid){
	console.log('in getallattachments');
	return db.query('SELECT id, firstName,sfid FROM salesforce.contact WHERE Id=$1', [userid], true);
};


function getAllAttachmentsMail(userid){
	/*console.log('in get all attachmentsfor mail'+userid);
	var userDetails;
	getUserDetails(userid).then(function(details){
		console.log('details'+JSON.stringify(details));
		userDetails=JSON.stringify(details);	
	}).catch(next);
	
	console.log('userdetails'+userDetails);
	*/
	return db.query('select Id,sfid,Name,ContentType,parentId,bodylength from salesforce.Attachment where (ContentType=$1 OR ContentType=$2) AND parentId=$3',['image/png','image/jpeg',userid]);
};

function getAllAttachmentsForMail(req,res,next){
	var id=req.params.id;
	console.log('sfid'+id);
	getAllAttachmentsMail(id).
	then(function(attachments){
		console.log('attachments mail method called');
		console.log('attachments'+JSON.stringify(attachments));
		//winston.info('attachments data returned '+JSON.stringify(attachments));
		return res.send(JSON.stringify(attachments));
	}).catch(next);
};

function getById(req, res, next) {
    var id = req.params.id;
    findById(id)
        .then(function (offer) {
            console.log(JSON.stringify(offer));
            return res.send(JSON.stringify(offer));
        })
        .catch(next);
};

/**
 * Delete a attachment from the attachments of the particular user
 * @param req
 * @param res
 * @param next
 */
function deleteItem(req, res, next) {
    
    var attachmentId = req.params.id;
    console.log('deleteattachment called'+attachmentId);
    
    db.query('DELETE FROM salesforce.attachment WHERE id=$1', [attachmentId], true)
        .then(function () {
            return res.send('OK');
        })
        .catch(next);
};



	var userName = config.api.userName,
		password = config.api.password;

    org = nforce.createConnection({
        clientId: config.api.clientId,
        clientSecret: config.api.clientSecret,
        redirectUri: config.api.redirectUri,
        apiVersion: config.api.apiVersion,  // optional, defaults to current salesforce API version
        environment: 'production',  // optional, salesforce 'sandbox' or 'production', production default
        mode: 'single' // optional, 'single' or 'multi' user mode, multi default
    });


org.authenticate({ username: userName, password: password}, function(err, resp) {
    if(!err) {
        console.log('nforce connection succeeded');
     
    } else {
        console.log('nforce connection failed: ' + err.message);
     
    }
});

function createTask(req, res, next) {
	
   console.log('task details '+JSON.stringify(req.body));
    db.query('SELECT sfid FROM salesforce.contact WHERE id=$1',[req.userId], true)
        .then(function (user) {
            console.log("sfid: " + user.sfid+' userid'+req.userId);
            // task is a reserved word. using _task instead.
            var _task = nforce.createSObject('Task');
            _task.set('WhoId', user.sfid);
	    _task.set('OwnerId', '005j000000BT3xh');
            _task.set('Subject', 'Request made for'+req.body.subject);
            _task.set('Description', 'Request for performing the operation '+ req.body.description + ' made.');
            _task.set('Priority', 'High');
            _task.set('Status', 'Not Started');
            _task.set('Type', 'Mailgapp');

            org.insert({ sobject: _task}, function(err, resp){
                if (err) {
                    console.log('First task insert failed: ' + JSON.stringify(err));
                    org.authenticate({username: userName, password: password}, function(err) {
                        if (err) {
                            console.log('Authentication failed: ' + JSON.stringify(err));
                            return next(err);
                        } else {
                            // retry
                            org.insert({ sobject: _task}, function(err, resp) {
                                if (err) {
                                    console.log('Second task insert failed: ' + JSON.stringify(err));
                                    return next(err);
                                } else {
                                    console.log('Second task insert worked');
                                    return res.send('ok');
                                }
                            });
                        }
                    })
                } else {
                    console.log('First task insert worked');
                    res.send('ok');
                }
            });
        })
        .catch(next);
};

/**
 * Create a signature capture
 * @returns {promise|*|Q.promise}
 */
function createSignatureCapture(req,res,next) {
    var deferred = Q.defer();
   var data=req.body;	
   console.log('createSignaturecapture called');
   console.log('data in createsignature'+data.AttachmentId__c+' '+data.RelatedContact__c);
    db.query('INSERT INTO salesforce.SignatureCapture__c (AttachmentId__c, RelatedContact__c, Signature__c) VALUES ($1, $2, $3)',
        [data.attachmentId,data.userId,data.signatureDataurl], true)
        .then(function (insertedData) {
            deferred.resolve(insertedData);
            console.log('data inserted');
            return res.send('OK');
        })
        .catch(function(err) {
           console.log('error'+err)	
            deferred.reject(err);
        });
};


exports.getAllAttachmentsForMail = getAllAttachmentsForMail;
exports.getAllAttachmentsMail = getAllAttachmentsMail;
exports.getAllAttachments = getAllAttachments;
exports.getAllAttachmentsForCourier = getAllAttachmentsForCourier;
exports.getAttachmentById = getAttachmentById;
exports.findAttachmentById = findAttachmentById;
exports.getAttachmentDetail=getAttachmentDetail;
exports.findAll = findAll;
exports.findById = findById;
exports.getAll = getAll;
exports.getById = getById;
exports.deleteItem = deleteItem;
exports.createTask = createTask;
exports.createSignatureCapture=createSignatureCapture;
