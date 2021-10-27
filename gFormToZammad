var POST_URL = "________";
var MY_TOKEN = "________"
function onSubmit(e) {
    var form = FormApp.getActiveForm();
    var allResponses = form.getResponses();
    var latestResponse = allResponses[allResponses.length - 1];
    var response = latestResponse.getItemResponses();
    
    // "collect e-mail function" under settings is required for this script to work
    var mail = allResponses[allResponses.length - 1].getRespondentEmail();

    // Creating the ticket body 
    var ticketBody ="";
    for (let i = 0; i < response.length; i++) {
       
       // The following code is only needed if you have your users uploading files. 
       // The id number needs to be adjusted based on the number of column your file ids are stored in.
       // In my case are column 6 and 9
 
       if (i === 6 )   
       {
        var string = response[i].getResponse().toString();
        var splitted = string.split(",");
        for (let h = 0; h < splitted.length; h++) 
          {
            ticketBody +=  "<br/>- https://drive.google.com/open?id=" + splitted[h];
        }
          continue;
        }
        if (i === 9 )   
       {
        var string = response[i].getResponse().toString();
        var splitted = string.split(",");
        for (let m = 0; m < splitted.length; m++) {
            ticketBody +=  "<br/>- https://drive.google.com/open?id=" + splitted[m];
        }
          continue;
        }
      ticketBody += "<strong>"+response[i].getItem().getTitle() +"</strong>: " + response[i].getResponse() + "<br/>"; 
     }

/* 
Setup your variables here

Keep in mind that the column number 0 it is usually your 3rd column since the 
time stamp and the e-mail are not considered by Apps Script index functions
*/
var group = "________";
var subject = response[2].getResponse();
var firstLastName = response[1].getResponse();
var tags = response[2].getResponse();

var article = {
  "subject": subject,
  "reply_to": mail,
  "from": firstLastName + " <" + mail + ">",
  "body": ticketBody,
  "type": "web",
  "sender": 2,
  "internal": false,
  "content_type": "text/html"
}

var ticket = {
  "title": subject,
  "group" : group",
  "article" : article,
  "customer_id" : "guess:" +  mail,
  "tags": tags, // "tags": "gets,ignored,anyway,noreply",

}

var options = {
  "method": "post",
  "contentType": "application/json",
  "headers":{"Authorization":"Token token="+ MY_TOKEN},
  "payload": JSON.stringify(ticket),
 // "muteHttpExceptions":true // In case you need a clean response message for debugging reasons
}

var answer = UrlFetchApp.fetch(POST_URL, options);
//Logger.log(answer.getResponseCode()); 

};
