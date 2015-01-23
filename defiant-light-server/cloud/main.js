var API = require('cloud/APIKeys.js');

var Mandrill = require('mandrill');
Mandrill.initialize(API.mandrill);

var fauxPoe = require('cloud/faux-poe.js');

Parse.Cloud.define("coinbaseOrder",function(request,response){
  
  console.log("request: ",JSON.stringify(request) );
  console.log("response: ",JSON.stringify(response));
  
  if (response.error){
    response.error("NO!");
  } else {
    response.success("it worked?");
  }
});


//query the DB for a specific value, then run the function
Parse.Cloud.define('prepareProduct', function(request, response){
  
  var Transaction = Parse.Object.extend("Transaction");
  var query = new Parse.Query(Transaction);
  query.equalTo("btcID", 2765);
  query.find({
    success: function(results) {
      //would change complete to true here, but might not be necessary anymore
      
      
      //Temporary DB for storing 
      var Temp = Parse.Object.extend("Temp");
      var temp = new Temp();
      temp.set("email", results.email);
      temp.set("quantity", results.quantity);
      temp.set('poem',fauxPoe());
      temp.save();
      
      
      response.success(results);
      // Do something with the returned Parse.Object values
      // for (var i = 0; i < results.length; i++) { 
      //   var object = results[i];
      //   alert(object.id + ' - ' + object.get('playerName'));
      // }
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });

  console.log(fauxPoe());
  
});


//parameters passed through the request object in key-value pairs
Parse.Cloud.define("addTransactionToDB", function(request, response){
  var Transaction = Parse.Object.extend("Transaction");
  var transaction = new Transaction();
  transaction.set("email",request.params.email);
  transaction.set("quantity",request.params.quantity);
  transaction.set('complete',false);
  transaction.set('btcID',request.params.bitcoinAddressID);
  transaction.save();
  response.success('saved');
  
});


Parse.Cloud.define("sendEmail", function(request, response) {
  //using Mandrill to send an email to client -- TODO
  
 Mandrill.sendEmail({
  message: {
    text: "Hello World!",
    subject: "Using Cloud Code and Mandrill is great!",
    from_email: "parse@cloudcode.com",
    from_name: "Cloud Code",
    to: [
      {
        email: "ebplaysgolf.forfun@yahoo.com",
        name: "LUUUUUKE!"
      }
    ]
  },
  async: true
  },{
  success: function(httpResponse) {
    console.log(httpResponse);
    response.success("Email sent!");
  },
  error: function(httpResponse) {
    console.error(httpResponse);
    response.error("Uh oh, something went wrong");
  }
  });  
  
});



Parse.Cloud.job("canary", function(request, response) {
  
  //send an email to the client
  Parse.Cloud.run("sendEmail", {}, {
    success: function(result) {
      console.log('valsdfasilvjlasidfj');
    },
    error: function(error) {
    }
  });

  //prepare the product by retrieving database information and running generative program
  Parse.Cloud.run("prepareProduct", {}, {
    success: function(result) {
      console.log(result);
    },
    error: function(error) {
    }
  });

  Parse.Cloud.run("addTransactionToDB", {email: 'bob@yahoo.com', quantity: 4, bitcoinAddressID: 123}, {
    success: function(result) {
      console.log(result);
    },
    error: function(error) {
    }
  });




  response.success('Cheep' );

  // response.error("Uh oh, something went wrong.");

  //this is where we'll hit the Coinbase API
    //that should return a list of transactions
  //Once every 15 minutes we'll loop through all the transactions we've saved in our database
    //and check each one against all the recent transactions sent back from the Coinbase API
    //if there's a match, we'll run our code
    //which should return a zipped file
    //which we'll email to the correct client's email address in an attachment
    //finally we'll change the 'completed' column to true.
    
  

});