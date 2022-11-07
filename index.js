const express = require('express');

const cors = require('cors');


const port = process.env.PORT || 5000;

require('dotenv').config()
const app = express()


// middleware
app.use(cors())

app.use(express.json())


app.get('/', (req, res) => {
    res.send("Home chef server is running")
})




const { MongoClient, ServerApiVersion } = require('mongodb');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7kbtzra.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

}

run().catch(error => console.log(error))


app.listen(port, () => {
    console.log("Server is running on port", port);
})
