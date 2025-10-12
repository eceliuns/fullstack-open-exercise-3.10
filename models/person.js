const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;
console.log("connecting to", url);
mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, "Name should be at least 3 characters long"],
    required: [true, "Name is required"],
  },
  number: {
    type: String,
    minLength: [8, "Phone number must be at least 8 characters long"],
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d+$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid phone number. Format must be XX-XXXXXXX or XXX-XXXXXXX.`,
    },
    required: [true, "Phone number is required"],
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
