var http = require('http');
var port = process.env.PORT || 3000;
var qs = require('querystring');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://Caleb3:test@cluster0.uskds.mongodb.net/my_companies?retryWrites=true&w=majority"; 


//gets data 
http.createServer(function (req, res) {
  

  var body = "";
req.on('data', function (chunk) {
  body += chunk;
});



req.on('end', function () {
    
//gets actual ticker and name data 
  var splitbody = body.split('&');

  var splitbody = body.split('ticker=',);
  
  var ticker = splitbody[1].split('&')[0];
  var name = splitbody[1].split('&name=')[1];
  
  
 //bool to tell if ticker or name is the thing your using 
 var usesticker = true;
 
 if(ticker == "" ) {
     usesticker = false;
     
 }
 

 
 //this is what happens if users input a name of company 
 if(usesticker == false) {
     
     //the way I send data, spaces and weird character are screwed up.
     //this fixes that. 
     name = (decodeURIComponent(name));
     
     while(name.includes("+") == true) {
         name = name.replace("+", " ");
     }

     res.write( "name: " + name );
     res.write( "<br>" );

     
     //Actual Query.
     MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
       if(err) { res.write("Connection err: " + err); return; }
     
       var dbo = db.db("my_companies");
      var coll = dbo.collection('companies');
      
      //Here, I'm searching for companies with the name of my name string.
      theQuery = {Company:name};
      
      coll.find(theQuery).toArray(function(err, items) {
          
            if (err) {
                res.write("Error: " + err);  
            } 
            
            if( items.length == 0 ) {
                res.write("No companies found.");
            }
            
            else   {
                for (i=0; i<items.length; i++) {
                    res.write("A ticker for " + items[i].Company + " is: " + items[i].Ticker);
                    res.write( "<br>" );

                }
            }
            
            db.close();
            
      })
   });  //end connect


 }
 
 //this is what happens if users input a stock ticker
 else {
     
     res.write( "ticker: " + ticker );
     res.write( "<br>" );

     
     //actual mongo query 
     MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
       if(err) { res.write("Connection err: " + err); return; }
     
       var dbo = db.db("my_companies");
      var coll = dbo.collection('companies');
      
      //here, the query is for things where the ticker is the same as user input
      theQuery = {Ticker:ticker};
            
      coll.find(theQuery).toArray(function(err, items) {
          
            if (err) {
                res.write("Error: " + err);  
            } 
            
            if( items.length == 0 ) {
                res.write("invalid company ticker.");
            }
            
            else   {
                for (i=0; i<items.length; i++) {
                    res.write("A Company for " + items[i].Ticker + " is: " + items[i].Company);
                    res.write( "<br>" );

                }
            }
            
            db.close();
            
      })

   });  //end connect


 }
 
  
});


res.writeHead(200, {'Content-Type': 'text/html'});
res.write("Stock Ticker");
res.write("<br>")


}).listen(8080);



