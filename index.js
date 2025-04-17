require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: '*', // Change this to your frontend URL instead of '*'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.02sbr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});


let voteCollection;

async function connectDB() {
    try {
        client.connect();
        const db = client.db('Voting');
        voteCollection = db.collection('votes');
        console.log("✅ Successfully connected to MongoDB!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
}

connectDB();
//=============================

app.get("/votes", async (req, res) => {
    try {
        const votes = await voteCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
        // Count the number of each vote type
        const counts = {
            Palestine: votes.filter(v => v.vote === "Palestine").length,
            Neutral: votes.filter(v => v.vote === "Neutral").length,
            Israel: votes.filter(v => v.vote === "Israel").length,
        };

        res.send({ status: true, counts, data: votes });
    } catch (error) {
        console.error("Error fetching votes:", error);
        res.status(500).send({ status: false, message: "Error fetching votes", error });
    }
});


app.post('/votes', async (req, res) => {
    try {
        const vote = req.body;
 
        const result = await voteCollection.insertOne(vote);
        res.send({ status: true, data: result });
    } catch (error) {
        res.status(500).send({ status: false, message: "Error adding task", error });
    }
});

//=============================
// Routes
app.get('/', (req, res) => {
    res.send({ status: true, message: `Server running at ${new Date().toLocaleTimeString()}` });
});

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
