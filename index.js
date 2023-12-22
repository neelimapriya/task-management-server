require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dtfuxds.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const userCollection = client.db("TaskManagement").collection("users");
    const taskCollection = client.db("TaskManagement").collection("task");

    //--------- jwt api--------
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "2h",
      });
      res.send({ token });
    });

    // ---------user collection----------
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({
          message: "This user is exist in the database",
          insertedId: null,
        });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // get user profile
    app.get("/userInfo", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query)
      const result = await userCollection.findOne(query);
      console.log(result)
      res.send(result);
    });

    // -----post task-----
    app.post("/addTask", async (req, res) => {
        const item = req.body;
        const result = await taskCollection.insertOne(item);
        res.send(result);
      });

    // -----get task-----
    app.get("/getTask", async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const result = await taskCollection.find(query).toArray();
        console.log(result)
        res.send(result);
      });

    //   ---make ongoing-----
    app.patch(
        "/ongoing/:id",
        async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
          const updatedDoc = {
            $set: {
              type: "ongoing",
            },
          };
          const result = await taskCollection.updateOne(filter, updatedDoc);
          res.send(result);
        }
      );
    //   ---make complete-----
    app.patch(
        "/complete/:id",
        async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
          const updatedDoc = {
            $set: {
              type: "complete",
            },
          };
          const result = await taskCollection.updateOne(filter, updatedDoc);
          res.send(result);
        }
      );


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("task management server is running");
});
app.listen(port, () => {
  console.log(`task management running on ${port}`);
});
