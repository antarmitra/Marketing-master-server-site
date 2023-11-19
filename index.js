const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.orneeg0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const categoryCollection = client.db('marketingMaster').collection('category');
        const bidCollection = client.db('marketingMaster').collection('bid');


        app.get('/category', async (req, res) => {
            const cursor = categoryCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })


        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { image: 1, job_title: 1, max_price: 1, min_price: 1, email: 1 }
            }
            const result = await categoryCollection.findOne(query, options);
            res.send(result)
        })


        app.post('/category', async (req, res) => {
            const addJob = req.body;
            const result = await categoryCollection.insertOne(addJob);
            res.send(result);
        })


        app.put('/category/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true }
            const newUpdateJob = req.body;
            const job = {
                $set: {
                    image: newUpdateJob.image,
                    category_name: newUpdateJob.category_name,
                    job_title: newUpdateJob.job_title,
                    deadline: newUpdateJob.deadline,
                    min_price: newUpdateJob.min_price,
                    max_price: newUpdateJob.max_price,
                    description: newUpdateJob.description
                }
            }
            const result = await categoryCollection.updateOne(filter, job, options);
            res.send(result)
        })


        app.delete('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await categoryCollection.deleteOne(query);
            res.send(result)
        })

        // my bid page and bid request page
        app.get('/bid', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bidCollection.find(query).toArray();
            res.send(result);
        })
        

        // bid request
        app.get('/bid/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await bidCollection.findOne(query)
            res.send(result)
        })


        app.post('/bid', async (req, res) => {
            const bid = req.body;
            console.log(bid);
            const result = await bidCollection.insertOne(bid);
            res.send(result)
        })


        app.patch('/bid/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateStatus = req.body;
            console.log(updateStatus);
            const updateDoc = {
                $set: {
                    status: updateStatus.status
                }
            }
            const result = await bidCollection.updateOne(filter, updateDoc);
            res.send(result)
        })







        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('online marketplace server is running')
})

app.listen(port, () => {
    console.log(`Marketing Master Server is running on port ${port}`);
})