const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7xlcz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('wanderlust');
        const tourplanCollection = database.collection('tourplans');
        const bookingCollection = database.collection('bookings');

        //GET: Get tour plans
        app.get('/tour-plans', async (req, res) => {
            const cursor = tourplanCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        //GET: Get tour plans by Id
        app.get('/plan-details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await tourplanCollection.findOne(query);
            res.json(result);
        });

        //GET: Get all bookings
        app.get('/booking', async (req, res) => {
            const cursor = bookingCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        //POST: Book tourplan
        app.post('/booking', async (req, res) => {
            const bookingDetails = req.body;
            const result = await bookingCollection.insertOne(bookingDetails);
            res.json(result);
        });

        //POST: Find bookings by user email
        app.post('/my-bookings', async (req, res) => {
            const userEmail = req.body.email;
            const query = { email: userEmail };
            const products = await bookingCollection.find(query).toArray();
            res.json(products);
        });

        //PUT: Approve booking
        app.put('/booking', async (req, res) => {
            const updatedBooking = req.body;
            console.log(updatedBooking);
            const filter = { _id: ObjectId(updatedBooking.bookingId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                },
            };

            const result = await bookingCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        //DELETE: Cancel Booking
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        });

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Server Running')
});

app.listen(port, () => {
    console.log('Listening at:', port);
})

// git push heroku main