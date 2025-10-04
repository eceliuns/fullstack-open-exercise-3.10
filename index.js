const express = require("express");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.static("dist"));

const cors = require("cors");
app.use(cors());
const Person = require("./models/person");

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

const morgan = require("morgan");
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :post")
);

morgan.token("post", (req) => {
  return req.method === "POST" ? JSON.stringify(req.body) : " ";
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      console.log(error);
      response.status(400).send({ error: "malformatted id" });
    });
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndDelete(request.params.id).then((result) => {
    if (result) {
      response.status(204).end();
    } else {
      response.status(404).send({ error: "person not found" });
    }
  });
});

// const generateId = () => {
//   let id = Math.floor(Math.random() * 1_000_000_000).toString();
//   while (persons.some((person) => person.id === id)) {
//     id = Math.floor(Math.random() * 1_000_000_000).toString();
//   }

//   return id;
// };

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body.name && !body.number) {
    return response.status(400).json({ error: "name and number missing" });
  }

  if (!body.name) {
    return response.status(400).json({ error: "name missing" });
  }

  if (!body.number) {
    return response.status(400).json({ error: "number missing" });
  }

  // if (persons.find((person) => person.name === body.name)) {
  //   return response.status(400).json({ error: "name must be unique" });
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.get("/info", (request, response) => {
  const time = new Date();

  Person.countDocuments({}).then((count) => {
    response.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${time}</p>
    `);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
