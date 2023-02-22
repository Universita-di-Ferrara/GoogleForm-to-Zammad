var POST_URL = "_______________/api/v1/tickets";

var MY_TOKEN = "___________________________";
var GROUP = "___________________________"; 
var SUBJECT = __________int_____________;
var FIRSTLASTNAME = _______________int____________;
var TAG = ______________int_____________;
var MAX_TRIES = __int__;

function onSubmit(event) {

  //in caso di errori ripetuti si potrebbe implementare una sleep iniziale

  // get all item responses contained in a form response
  var formResponse;

  try {
    formResponse = exponentialBackoff_(event, 5)
  } catch (error) {
    console.log("onSubmit catch --> event: " + event)
    console.log("onSubmit catch --> error message: " + error.message);
    //email da implementare
    sendEmailtoSupport("onSubmit",error)
    sendChatMessage(error.message)
  }
  var ticket = buildTicket(formResponse, GROUP);

  try {
    // API call
    createTicket(ticket, POST_URL, MY_TOKEN, event);
  } catch (error) {
    //
    handleError(error, ticket, event);
    // rethrow the exception so the form's owner is notified
    throw error;
  } finally {

  }
}
function buildTicket(formResponse, group) {
  // Since we've activated the "collect e-mail function" under settings of our form (required for this script to work) 
  var email = formResponse.getRespondentEmail();
  console.log("email: " + email);

  // 
  var itemResponses = formResponse.getItemResponses();

  // Creating the ticket body 
  var ticketBody = "";
  for (let i = 0; i < itemResponses.length; i++) {

    // The following is only needed if you have your user uploading files. 
    //The id number needs to be adjusted based on the number of column your file ids are stored in.
    /**if (i === 6 )    **/
    if (itemResponses[i].getItem().getType() == "FILE_UPLOAD") {
      var string = itemResponses[i].getResponse().toString();
      var splitted = string.split(",");

      for (let h = 0; h < splitted.length; h++) {
        ticketBody += "<br/>- https://drive.google.com/open?id=" + splitted[h];
      }
      continue;
    }
    /** if (i === 9 )   
   {
    var string = response[i].getResponse().toString();
    var splitted = string.split(",");

    for (let m = 0; m < splitted.length; m++) {
     ticketBody +=  "<br/>- https://drive.google.com/open?id=" + splitted[m];
    }
      continue;
    }**/
    ticketBody += "<strong>" + itemResponses[i].getItem().getTitle() + "</strong>: " + itemResponses[i].getResponse() + "<br/>";
  }
  Logger.log(ticketBody)
  // Setup here 
  var subject = itemResponses[SUBJECT].getResponse()
  var firstLastName = itemResponses[FIRSTLASTNAME].getResponse()
  var tags = itemResponses[TAG].getResponse()

  var article = {
    "subject": subject,
    "reply_to": email,
    "from": firstLastName + " <" + email + ">",
    "body": ticketBody,
    "type": "web",
    "sender_id": 2,
    "internal": false,
    "content_type": "text/html"
  };
  Logger.log(article)

  var ticket = {
    "title": subject,
    "group": group,
    "article": article,
    "customer_id": "guess:" + email,
    "tags": tags
  };

  return ticket;
}
function createTicket(ticket, post_url, token, event) {
  var options = {
    "method": "post",
    "contentType": "application/json",
    "headers": { "Authorization": "Token token=" + token },
    "payload": JSON.stringify(ticket),
    "muteHttpExceptions": false
  };

  Logger.log(options);
  var httpResponse = UrlFetchApp.fetch(post_url, options);
  console.log("Response Code: " + httpResponse.getResponseCode());

  var email = event.response.getRespondentEmail();
  var formTitle = event.source.getTitle();

  // notify the user that it's all ok
  MailApp.sendEmail({
    noReply: true,
    to: email,
    subject: "Form inviato con successo: " + formTitle,
    htmlBody: "<p>La tua richiesta è stata inoltrata al nostro sistema di ticket</p>"
  });

  //return httpResponse;
}


function handleError(error, ticket, event) {
  // cloud log
  console.error("error: " + error);
  console.error("ticket: " + JSON.stringify(ticket));

  var email = event.response.getRespondentEmail();
  var formTitle = event.source.getTitle();
  var formURL = event.response.toPrefilledUrl();
  var admins = "___@___';
  var logURL = event.response.toPrefilledUrl();

  // notify the user that there was an error and give it the url to re-submit
  MailApp.sendEmail({
    noReply: true,
    to: email,
    subject: "There was an error on form: " + formTitle,
    htmlBody: "<p>your request was not submitted</p>" +
      "<p>click to resumbit: <a href='" + formURL + "'>resubmit</a></p>",
  });


  // notify the admins/developers that there was an error and give them the url to investigate
  MailApp.sendEmail({
    noReply: true,
    to: admins,
    subject: "There was an error on form: " + formTitle,
    htmlBody: "<p>investigate on GCP console:</p>" +
      "<a href='" + logURL + "'>resubmit</a>",
  });

}



/**
* Calls a closure, retries on failure, and returns the value it gives.
*
* Usage:
*   exponentialBackoff_(myFunction);
*   // ...or:
*   exponentialBackoff_(() => myFunction(param1, param2));
*   // ...or:
*   const result = exponentialBackoff_(() => myFunction(param1, param2));
*   // ...or:
*   const respondentEmail = exponentialBackoff_(() => e.response.getRespondentEmail());
*
* @see https://en.wikipedia.org/wiki/Exponential_backoff
* @param {Function} action The closure to call.
* @param {Number} maxNumTries Optional. The number of times to retry. Defaults to 5.
* @return {Object} The closure return value.
*/
function exponentialBackoff_(event, maxNumTries = MAX_TRIES) {
  // version 1.0, written by --Hyde, 29 December 2022
  //  - see https://stackoverflow.com/a/74952372/13045193
  for (let tryNumber = 1; tryNumber <= maxNumTries; tryNumber++) {
    try {
      if (event == undefined) throw Error("Event undefined")
      if (event.response == undefined) throw Error("Event.response undefined")
      return event.response;
    } catch (error) {
      console.log("exponentialBackoff_ errorlog --> error message: " + error.message)
      //anche qui email da inviare
      sendEmailtoSupport("exponentialBackoff_",error)
      if (tryNumber >= maxNumTries) {
        throw error;
      }
      Utilities.sleep(2 ** (tryNumber - 1) * 1000);
    }
  }
}




function sendChatMessage(message) {

  const GOOGLE_CHAT_WEBHOOK_LINK = "https://chat.googleapis.com/v1/spaces/__________";

  const payload = JSON.stringify({ text: message });
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: payload,
  };
  UrlFetchApp.fetch(GOOGLE_CHAT_WEBHOOK_LINK, options);

}

function sendEmailtoSupport(fname,error) {

  var admins = "admin@_______.com"
  var scriptExecution = "https://script.google.com/home/projects/_______/executions"
  MailApp.sendEmail({
    noReply: true,
    to: admins,
    subject: "There was an error on form Sicurezza sul lavoro",
    htmlBody: "<p>Inside " + fname + " there was an error: " + error.message + "</p><br>" +
      "link to <a href='" + scriptExecution + "'>Script</a>",
  });

}
