const express = require("express");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.static("dist"));

const cors = require("cors");
app.use(cors());
const Person = require("./models/person");

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

const morgan = require("morgan");
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :post")
);

morgan.token("post", (req) => {
  return req.method === "POST" ? JSON.stringify(req.body) : " ";
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        const error = new Error("Person not found");
        error.name = "NotFound";
        return next(error);
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        const error = new Error("Person not found");
        error.name = "NotFound";
        return next(error);
      }

      person.name = name;
      person.number = number;

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson);
      });
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      if (!result) {
        const error = new Error("person does not exist");
        error.name = "NotFound";
        return next(error);
      }
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (!body.name && !body.number) {
    const error = new Error("name and number missing");
    error.name = "ValidationError";
    return next(error);
  }

  if (!body.name) {
    const error = new Error("name missing");
    error.name = "ValidationError";
    return next(error);
  }

  if (!body.number) {
    const error = new Error("number missing");
    error.name = "ValidationError";
    return next(error);
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
  const time = new Date();

  Person.countDocuments({})
    .then((count) => {
      response.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${time}</p>
    `);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  if (error.name === "NotFound") {
    return response.status(404).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
