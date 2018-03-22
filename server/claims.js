    var db = require('./pghelper'),
    config = require('./config'),
    nforce = require('nforce'),
     

    userName = config.api.userName,
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

function createClaims(req, res, next) {

 db.query('SELECT sfid FROM salesforce.contact WHERE id=$1',[req.userId], true)
        .then(function (user) {
            console.log(req.userId+"---------sfid------------------>: " + user.sfid);
            // case is a reserved word. using _case instead.
            var claimObj = nforce.createSObject('Claim__c');
            claimObj.set('Claimant_Name__c', req.body.claimant);
            claimObj.set('Communication_Address__c', req.body.address);
            claimObj.set('PAN_Number__c', req.body.panno);
            claimObj.set('Policy_Holder_Name__c', req.body.policyholdername);
            claimObj.set('Telephone_Number__c', req.body.phone);
            claimObj.set('Linked_Contact__c', req.userId);
            

            org.insert({ sobject: claimObj}, function(err, resp){
                if (err) {
                    console.log('First case insert failed: ' + JSON.stringify(err));
                    org.authenticate({username: userName, password: password}, function(err) {
                        if (err) {
                            console.log('Authentication failed: ' + JSON.stringify(err));
                            return next(err);
                        } else {
                            // retry
                            org.insert({ sobject: claimObj}, function(err, resp) {
                                if (err) {
                                    console.log('Second case insert failed: ' + JSON.stringify(err));
                                    return next(err);
                                } else {
                                    console.log('Second case insert worked');
                                    return res.send('ok');
                                }
                            });
                        }
                    })
                } else {
                    console.log('First case insert worked');
                    res.send('ok');
                }
            });
        })
.catch(next);
    
};

function revokeToken(req, res, next) {
    org.revokeToken({token: org.oauth.access_token}, function(err) {
        if (err) {
            return next(err);
        } else {
            res.send('ok');
        }
    });

}

exports.createClaims = createClaims;
exports.revokeToken = revokeToken;
