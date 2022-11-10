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




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7kbtzra.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    const serviceCollections = client.db("houseChef").collection("services")

    const reviewCollections = client.db("houseChef").collection("reviews")


    //get all services
    app.get('/services', async (req, res) => {

        const show = parseInt(req.query.show);
        const query = {};
        const cursor = serviceCollections.find(query)
        if (req.query) {
            const result = await cursor.limit(show).toArray()
            res.send(result)
        } else {
            const result = await cursor.toArray()
            res.send(result)
        }
    })

    //get specific item

    app.get('/service/:id', async (req, res) => {
        const id = req.params.id;
        console.log(id);
        const query = { _id: ObjectId(id) }
        const result = await serviceCollections.findOne(query)
        res.send(result)

    })


    // add review 
    app.post('/reviews', async (req, res) => {
        const review = req.body;
        const result = await reviewCollections.insertOne(review);
        res.send(result)
    })

    //get review

    app.get('/reviews', async (req, res) => {
        const query = {}
        const cursor = reviewCollections.find(query)

        const result = await cursor.toArray()

        res.send(result)

    })


    app.get("/reviews/:id", async (req, res) => {
        const id = req.params.id;

        const query = { _id: ObjectId(id) }

        const result = await reviewCollections.findOne(query);

        res.send(result);
    })

    //update
    app.put('/reviews/:id', async (req, res) => {
        const id = req.params.id;
        console.log(id);
        const message = req.body.message;
        console.log(message);
        const options = { upsert: true };
        const search = { serviceId: id }

        const updateDoc = {
            $set: {
                message: message
            }
        }

        const result = await reviewCollections.updateOne(search, updateDoc, options);
        res.send(result)

    })


    // delete a item

    app.delete('/reviews/:id', async (req, res) => {
        const id = req.params.id;
        const search = { serviceId: id }
        const result = await reviewCollections.deleteOne(search);
        res.send(result)
    })



}

run().catch(error => console.log(error))


app.listen(port, () => {
    console.log("Server is running on port", port);
})
