var ldap = require('ldapjs');
var domParser = require('xmldom').DOMParser;
var select  = require('xpath.js');
var nodegrass = require('nodegrass');
var colors = require('colors');

//author: guojial@cn.ibm.com
//version: v1.0.7

//first param: intranetID 
module.exports.getNameByIntranetID = function (intranetID, callback) {

    var result;
    //console.log(("-----groupname-----"+groupname).blue);
    nodegrass.get("http://faces.tap.ibm.com/BpHttpApisv3/slaphapi?ibmperson/mail=" + intranetID + ".list/byxml", function(data,status,headers){
          //console.log(status);
          var doc = new domParser().parseFromString(data);
          //console.log(("-----attr-----"+select(doc, "//attr").length).blue);
          if (select(doc, "//attr").length > 0) {
            var nodeGivenname = select(doc, "//attr[@name='givenname']/value");
            var nodeGivennameValue = nodeGivenname[0].firstChild.data;

            var nodeSn = select(doc, "//attr[@name='sn']/value");
            var snValue = nodeSn[0].firstChild.data;

            result = nodeGivennameValue + " " + snValue;
          } else {
            result = "error";
          }

          //console.log(("-----result-----"+result).blue);
          callback(result);
          },'utf8').on('error', function(e) {
          console.log(("Got error: " + e.message).red);
    });
};

//first param: intranetID
getDnValue = function (intranetID, callback) {

    var result;
    //console.log(("-----groupname-----"+groupname).blue);
    nodegrass.get("http://faces.tap.ibm.com/BpHttpApisv3/slaphapi?ibmperson/mail=" + intranetID + ".list/byxml", function(data,status,headers){
          //console.log(status);
          var doc = new domParser().parseFromString(data);
          var nodes = select(doc, "//directory-entries/entry");
          if (nodes.length==0) {
            return callback(false);
          }
          result = nodes[0].getAttribute('dn');
          //console.log(("-----result-----"+result).blue);
          callback(result);
          },'utf8').on('error', function(e) {
          console.log(("Got error: " + e.message).red);
    });
};

//first param: intranetID, second param: password.
module.exports.authenticate = function(intranetID, password, callback) {

  var result = false;

  getDnValue(intranetID, function(dnValue) {

    if (dnValue==false) {
            return callback(false);
        }

    var reg_1 = /,/;   
    var reg_2 = /=/;

    var uidStr = dnValue.split(reg_1)[0];
    var uid = uidStr.split(reg_2)[1];

    //console.log(('uid: ' + uid).blue);

    var client = ldap.createClient({
     url: 'ldap://bluepages.ibm.com:389'
    });

    var opts = {
     filter: '(uid='+ uid +')',
     scope: 'sub',
     timeLimit: 500 
    };

    try {
        client.bind(dnValue, password, function (error) {
            if(error){
                //console.log(error.message);
                result = false;
                callback(result);
                client.unbind(function(error) {
                  if(error) {
                    console.log(("unbind error: " + error.message).red);
                  } else {
                    //console.log(("client disconnected on searchEntry").blue);
                  }});
            } else {
                //console.log(("connected").blue);
                client.search('c=cn,ou=bluepages,o=ibm.com', opts, function(error, search) {
                    
                    //console.log(("opts" + opts.filter).blue);

                    //console.log("Searching.....".blue);
                    search.on('searchEntry', function(entry) {
                        if(entry.object){
                            //console.log('entry: %j ' + JSON.stringify(entry.object));
                            result = true;
                            callback(result);
                        }
                        client.unbind(function(error) {
                          if(error){
                            console.log(("unbind error: " + error.message).red);
                          } else {
                            //console.log(("client disconnected on searchEntry").blue);
                          }});
                    });

                    search.on('error', function(error) {
                        console.error('error: ' + error.message);
                        client.unbind(function(error) {
                          if(error){
                            console.log(("unbind error: " + error.message).red);
                          } else {
                            console.log(("client disconnected on searchEntry").blue);
                          }});
                    });

                });
            }
        });
    } catch(error){
        console.log(error);
        client.unbind(function(error) {
          if(error){
             console.log(("unbind error: " + error.message).red);
          } else {
             console.log(("client disconnected on searchEntry").red);
          }});
    }

    
  });

};

//first param: intranetID
getAttrValue = function (intranetID, attrName, callback) {

    var result;
    //console.log(("-----groupname-----"+groupname).blue);
    nodegrass.get("http://faces.tap.ibm.com/BpHttpApisv3/slaphapi?ibmperson/mail=" + intranetID + ".list/byxml", function(data,status,headers){
          //console.log(status);
          var doc = new domParser().parseFromString(data);
          var nodes = select(doc, "//directory-entries/entry/attr");
          if (nodes.length==0) {
            return callback(false);
          }
          var nodeValue;
          //console.log("-----"+attrName);
          //console.log("-----"+nodes.length);
          for (var i = 0;i<nodes.length;i++) {
            if (attrName == nodes[i].getAttribute("name")) {
              //console.log("-----"+nodes[i].getAttribute("name"));
              //console.log("-----"+select(doc, "//attr[@name='"+attrName+"']/value/text()"));
        nodeValue = select(doc, "//attr[@name='"+attrName+"']/value/text()");
        //console.log("-----"+nodeValue);
            } 
          }
          result = nodeValue;
          //console.log(("-----result-----"+result).blue);
          callback(result);
          },'utf8').on('error', function(e) {
          console.log(("Got error: " + e.message).red);
    });
};

//http://faces.tap.ibm.com:10000/image/xxx.jpg
module.exports.getPhotoByIntranetID = function(intranetID, callback) {

  var result;
  getAttrValue(intranetID, "uid", function(uidValue) {
    if (uidValue==false) {
            return callback(false);
        }
      result = "http://faces.tap.ibm.com:10000/image/" + uidValue +".jpg";    
      callback(result);
  });
}


module.exports.getPersonInfoByIntranetID = function(intranetID, callback) {

    var result;
    nodegrass.get("http://faces.tap.ibm.com/BpHttpApisv3/slaphapi?ibmperson/mail=" + intranetID + ".list/byxml", function(data,status,headers){
          var doc = new domParser().parseFromString(data);
          if (select(doc, "//attr").length > 0) {
      var nodeGivenname = select(doc, "//attr[@name='givenname']/value");
            var nodeGivennameValue = nodeGivenname[0].firstChild.data;

            var nodeSn = select(doc, "//attr[@name='sn']/value");
            var snValue = nodeSn[0].firstChild.data;

            var userName = nodeGivennameValue + " " + snValue;
          
            nodeUidValue = select(doc, "//attr[@name='uid']/value/text()");
            var userPhoto = "http://faces.tap.ibm.com:10000/image/" + nodeUidValue +".jpg";
      
            var userJobrespons;
            if (select(doc, "//attr[@name='jobresponsibilities']").length > 0) {
              userJobrespons = select(doc, "//attr[@name='jobresponsibilities']/value/text()")[0].data;
            } else {
              userJobrespons = "";
            }

            var userTelephonenumber;
            if (select(doc, "//attr[@name='telephonenumber']").length > 0) {
              userTelephonenumber = select(doc, "//attr[@name='telephonenumber']/value/text()")[0].data;
            } else {
              userTelephonenumber = "";
            }

            var userNotesemail;
            if (select(doc, "//attr[@name='notesemail']").length > 0) {
              userNotesemail = select(doc, "//attr[@name='notesemail']/value/text()")[0].data;
            } else {
              userNotesemail = "";
            }

            result = {
              "userName" : userName,
              "userPhoto" : userPhoto,
              "userJobrespons" : userJobrespons,
              "userTelephonenumber" : userTelephonenumber,
              "userNotesemail" : userNotesemail
            }

          } else {
            result = "error";
          }

          //console.log(("-----result-----"+result).blue);
          callback(result);
          },'utf8').on('error', function(e) {
          console.log(("Got error: " + e.message).red);
    });
}