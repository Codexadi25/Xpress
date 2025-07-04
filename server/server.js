import express from "express"
import cors from 'cors';

const app = express();

const port = process.env.PORT || 8080;

// app.use(cors());

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests only from your React app's origin
  methods: ['GET', 'POST'], // Allow specific HTTP methods
  credentials: true, // Allow sending cookies and other credentials
  optionsSuccessStatus: 204
}));

const jokes = [
  {
    "id": 1,
    "title": "The Mathematician's Parrot",
    "content": "Why was the math book sad? Because it had too many problems."
  },
  {
    "id": 2,
    "title": "Invisible Man's Doctor",
    "content": "What did the invisible man say to the doctor? \"I can't see myself getting better.\""
  },
  {
    "id": 3,
    "title": "Cheesy Joke",
    "content": "What do you call cheese that isn't yours? Nacho cheese!"
  },
  {
    "id": 4,
    "title": "Why did the scarecrow win an award?",
    "content": "Because he was outstanding in his field!"
  },
  {
    "id": 5,
    "title": "Parallel Lines",
    "content": "Parallel lines have so much in common. It’s a shame they’ll never meet."
  }
]

app.get("/", (req,res) => {
  res.send("App is working fine")
})

app.get("/api/jokes", (req, res) => {
  res.send(jokes)
});

app.get("/api/user", (req, res) => {
  res.send({username:"aditya.sahu"})
})

app.listen(port, () => {
  console.log(`App is listening on port ${port}`); 
})