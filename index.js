const express = require('express')
const app = express()
const admin = require('firebase-admin');
require('dotenv').config();
const bodParser = require('body-parser');
const cors = require('cors');
console.log(process.env.DB_USER)
app.use(cors());
app.use(bodParser.json());
//firebase admin sdk
const serviceAccount = require("./ride-on-rental-firebase-adminsdk-xsbi1-d8160514ba.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.htf6k.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("burjAlArab").collection("bookings");
  app.post('/addBooking', (req, res) =>{
  	const newBooking = req.body;
  	collection.insertOne(newBooking)
  	.then(result =>{
  		res.send(result.insertedCount > 0);
  	})
  })

  	app.get('/bookings', (req, res) => {
  		const bearer = req.headers.authorization;
  		if(bearer && bearer.startsWith("Bearer")){
  			const idToken = bearer.split(' ')[1];
  			admin.auth().verifyIdToken(idToken)
			  .then((decodedToken) => {
			    const tokenEmail = decodedToken.email;
			    const bodyEmail = req.query.email;
			    if(tokenEmail == req.query.email){
			    	collection.find({email: req.query.email})
				  		.toArray((err, documents) =>{
				  			res.status(200).send(documents)
				  		})
			    }
			    else{
			    	res.status(401).send("unauthorized access");
			    }
			    
			  })
			  .catch((error) => {
			   		res.status(401).send("unauthorized access");
			  });
  		}
  		else{
  			res.status(401).send("unauthorized access");
  		}


  		
  	})

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(8000)