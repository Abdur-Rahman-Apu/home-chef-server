const express = require('express');

const cors = require('cors');


const port = process.env.PORT || 5000;


var jwt = require('jsonwebtoken');

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


function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    console.log("header", authHeader);

    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }

    const token = authHeader.split(' ')[1]
    console.log("token", token);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })


}

async function run() {

    const serviceCollections = client.db("houseChef").collection("services")

    const reviewCollections = client.db("houseChef").collection("reviews")

    //jwt 
    app.post('/jwt', (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' })
        res.send({ token })
    })


    //get all services
    app.get('/services', async (req, res) => {

        const show = parseInt(req.query.show);
        const query = {};
        const cursor = serviceCollections.find(query).sort({ serviceId: -1 })
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
        const id = parseInt(req.params.id);
        console.log("service id: ", id);
        const query = { serviceId: id }
        const result = await serviceCollections.findOne(query)
        res.send(result)

    })

    // insert 
    app.post('/services', async (req, res) => {
        const data = req.body;
        console.log("services", data);
        const result = await serviceCollections.insertOne(data)
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


        // const decoded = req.decoded;

        // console.log("email", decoded.email);

        // if (decoded.email !== req.query.email) {

        //     res.status(403).send({ message: 'unauthorized access' })
        // }

        let query = {}

        if (req.query.email) {
            query = { email: req.query.email }
        }
        const cursor = reviewCollections.find(query)

        const result = await cursor.toArray()

        res.send(result)

    })


    app.get("/reviews/:id", async (req, res) => {
        // const decoded = req.decoded;

        // console.log("email", decoded.email);

        // if (decoded.email !== req.query.email) {

        //     res.status(403).send({ message: 'unauthorized access' })
        // }
        const id = parseInt(req.params.id);
        console.log("id", id);
        const query = { serviceId: id }
        console.log("review id query:", query);
        const cursor = reviewCollections.find(query).sort({ addedTime: -1 });
        const result = await cursor.toArray()

        res.send(result);
    })

    app.get("/changeReview/:id", async (req, res) => {

        const id = req.params.id;
        console.log("id", id);
        const query = { _id: ObjectId(id) }
        const result = await reviewCollections.findOne(query)
        res.send(result);
    })

    app.put("/changeReview/:id", async (req, res) => {

        const id = req.params.id;
        console.log(id);
        const message = req.body.message;
        console.log(message);
        console.log("id", id);
        const query = { _id: ObjectId(id) }
        const updateDoc = {
            $set: {
                message: message
            },
        };
        const result = await reviewCollections.updateOne(query, updateDoc)
        res.send(result);
    })



    //update
    app.put('/reviews/:id', async (req, res) => {
        const id = req.params.id;
        console.log("review id", id);
        const message = req.body.message;
        console.log("update message", message);

        const search = { _id: ObjectId(id) }

        const updateDoc = {
            $set: {
                message: message
            }
        }

        const result = await reviewCollections.updateOne(search, updateDoc);
        res.send(result)

    })


    // delete a item

    app.delete('/reviews/:id', async (req, res) => {
        const id = req.params.id;
        console.log("delete", id);
        const search = { _id: ObjectId(id) }
        const result = await reviewCollections.deleteOne(search);
        res.send(result)
    })





}

run().catch(error => console.log(error))


app.listen(port, () => {
    console.log("Server is running on port", port);
})
