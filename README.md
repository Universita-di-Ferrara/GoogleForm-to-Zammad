# Create a Ticket in Zammad using Google Form
When a user submit a request via Google Form, an Apps Script trigger function creates a Ticket in Zammad via API.<br/>
This script requires some setup in Google Form and Zammad so I recomend reading this post: [here](
https://medium.com/@TheDummyDev/create-a-ticket-in-zammad-via-google-form-using-apps-script-609c6c84712a)

# Important!
This script works fine for low traffic forms. If you have a form with lots of requests you have to consider a race hazards. Since the script doesn't read the submitted datas from the onSubmit function but from the spreadsheet last item if two users click the button at the same time it may occurs that only one ticket is created.ù
