var POST_URL = "_______________/api/v1/tickets";

var MY_TOKEN = "___________________________";
var GROUP = "___________________________"; 
var SUBJECT = __________int_____________;
var FIRSTLASTNAME = _______________int____________;
var TAG = ______________int_____________;

function onSubmit(e) {
  // get all item responses contained in a form response
  var formResponse;
 
  try{
    formResponse = exponentialBackoff_(e.response,5)
  }catch (error) {
    console.log(error.message);
  }
  

  var ticket = buildTicket(formResponse, GROUP);

  try {
    // API call
    createTicket(ticket, POST_URL, MY_TOKEN, e);
  } catch(error) {
    //
    handleError(error, ticket, e);
    // rethrow the exception so the owner is notified
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
  var ticketBody ="";
  for (var i = 0; i < itemResponses.length; i++) {
    ticketBody += "<strong>"+itemResponses[i].getItem().getTitle() +"</strong>: " + itemResponses[i].getResponse() + "<br/>"; 
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
    "headers": { "Authorization":"Token token=" + token },
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
  var admins = '____@____';
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
function exponentialBackoff_(action, maxNumTries = 5) {
  // version 1.0, written by --Hyde, 29 December 2022
  //  - see https://stackoverflow.com/a/74952372/13045193
  for (let tryNumber = 1; tryNumber <= maxNumTries; tryNumber++) {
    try {
      return action;
    } catch (error) {
      if (tryNumber >= maxNumTries) {
        throw error;
      }
      Utilities.sleep(2 ** (tryNumber - 1) * 1000);
    }
  }
}


