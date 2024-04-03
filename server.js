const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const multer = require('multer');
const path = require('path'); 
const fs = require('fs');
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;
const session = require('express-session');

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
// Parse JSON bodies
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.set("views", "./views");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage });

// Route to render the upload form
app.get('/upload', (req, res) => {
  res.render('upload', { title: 'Send a File to Moon' });
});

// Handle the file upload
app.post('/upload', upload.single('image'), (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).send('No file uploaded.');
  }

  console.log('Uploaded file:', uploadedFile);

  // Update homepageData to include the path to the uploaded image
  homepageData.uploadedImage = `/uploads/${uploadedFile.filename}`;

  res.redirect('/'); 
});

const uploadDirectory = 'public/uploads';

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// Route to render the homepage with new data
app.get('/', (req, res) => {
  res.render('index', { title: 'Artwork Gallery', homepageData: homepageData });
});

const galleryData = {
  artworks: [
    { title: 'Artwork 1', artist: 'Artist 1', image: 'image1.jpeg' },
    { title: 'Artwork 2', artist: 'Artist 2', image: 'image2.jpeg' },
  ]
};

// Get an array of image paths
const imagePaths = galleryData.artworks.map(artwork => `/images/${artwork.image}`);


// Data for the exhibition page
const exhibitionData = {
  upcomingEvents: [
    { title: 'Moon Rum Tour', date: 'March 31, 2024', location: 'Moon Art Gallery' },
    { title: 'Elixir Play Date', date: 'April 15, 2024', location: 'Moon Art Gallery' },
    // Add more events as needed
  ]
};

app.get('/gallery', (req, res) => {
  const imagePaths = galleryData.artworks.map(artwork => `/images/${artwork.image}`);
  res.render('gallery', { title: 'Our Artwork', imagePaths: imagePaths }); 
});

// Route to render the exhibition page
app.get("/exhibition", async function (req, res) {    
  res.render('exhibition', { title: 'Exhibition & You', exhibitionData: exhibitionData });
});

// Route for rendering the signup page
  app.get('/signup', (req, res) => {
    // Retrieve user data from the database
    Name.find().exec()
      .then(data => {
        // Render the signup page and pass the retrieved user data to the template
        res.render('signup', { title: 'Sign Up', data: data });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send('Error fetching user data');
      });
  });
  
  app.post('/signup', (req, res) => {
    // Extract user input from the request body
    const { firstName, lastName } = req.body;
  
    // Create a new Name document with the extracted data
    const newUser = new Name({ fName: firstName, lName: lastName });
  
    // Save the new user to the database
    newUser.save()
      .then(() => {
        console.log('New user added:', newUser);
        res.redirect('/signup'); // Redirect to the signup page after successful signup
      })
      .catch(err => {
        console.log(err);
        res.status(500).send('Error adding new user');
      });
  });

  app.get("/signup", (req, res) => {

    //Sort names from first to last 
    Name.find().sort({createdAt: 1}).exec().then((data) => {
        res.render("signup", { data })
    }).catch(err => {
        console.log(err)
    })
})


//Copy the connection from MongoDB into here
const DB = `mongodb+srv://ankoredbutterfly:BZe8dKLG16q2JxWI@cluster0.ya2em8t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

let Schema = mongoose.Schema;

//Allow the user to upload a name 
const nameSchema = new Schema({
    fName: String,
    lName: String
})

let Name = mongoose.model('names', nameSchema)

//Middleware - Allows to use helper functions for routes 
app.use(express.urlencoded({ extended: true }))

// Define MongoDB Schema for contact form data
const contactSchema = new Schema({
  name: String,
  email: String,
  message: String
}); // Added the closing curly brace

// Create MongoDB Model for contact form
const Contact = mongoose.model('contact', contactSchema);

// Export the Contact model
module.exports = Contact;

// Handle GET requests to render the contact form page
app.get("/contact", (req, res) => {
  // Render the contact form page with the provided HTML content
  res.send(homepageData.contactForm);
});

// Handle form submission for the contact form
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body; // Extract contact form data

  // Create a new Contact document with the extracted data
  const newContact = new Contact({ name, email, message });

  // Save the new contact to the database
  newContact.save()
    .then(() => {
      console.log("Successfully created a new contact");
      req.session.contactData = { name, email, message };
      res.redirect("/confirmation"); // Redirect to the contact page after successful submission
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Failed to add new contact");
    });
});


// Define route handler for "/confirmation"
app.get("/confirmation", async (req, res) => {
  try {
    // Retrieve contact data from MongoDB
    const contacts = await Contact.find();
    
    // Retrieve contact data from the session, if needed
    const contactData = req.session.contactData;

    // Render the confirmation page (confirmation.ejs) and pass the contact data
    res.render("confirmation", { contacts: contacts, contact: contactData });
  } catch (error) {
    console.error("Error rendering confirmation page:", error);
    res.status(500).send("Internal Server Error");
  }
});


const homepageData = {
  welcomeMessage: "Welcome to Moon Art Gallery",
  slogan: "Discover stunning masterpieces by emerging artists",
  contactForm: `
    <h2>Contact Us</h2>
    <form action="/contact" method="POST">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required><br><br>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required><br><br>
        <label for="message">Message:</label><br>
        <textarea id="message" name="message" rows="4" cols="50" required></textarea><br><br>
        <input type="submit" value="Submit">
    </form>
  `,
  homeImage: "/images/image4.jpeg"
};


//Add name 
app.post("/addName", (req, res) => {
  const { fName, lName } = req.body;
  const newName = new Name({ fName, lName });

  newName.save().then(() => {
      console.log("Successfully created a new name");
      res.redirect("/signup");
  }).catch(err => {
      console.log(err);
      res.status(500).send("Failed to add new name");
  });
});

app.post("/updateName", (req, res) => {
  if(req.body.lName.length === 0 && req.body.fName.length === 0) {
      Name.deleteOne({ _id: req.body._id }).exec().then(() => {
          console.log("Successfully removed name: " + req.body._id);
          res.redirect("/signup");
      }).catch(err => {
          console.log(err);
          res.status(500).send("Failed to remove name");
      });
  } else {
      Name.updateOne({ _id: req.body._id }, {
          $set: {
              lName: req.body.lName,
              fName: req.body.fName 
          }
      }).exec().then(() => {
          console.log("Successfully updated name: " + req.body._id);
          res.redirect("/signup");
      }).catch(err => {
          console.log(err);
          res.status(500).send("Failed to update name");
      });
  }
});


mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  //Once we connect to MongoDB, have the app start listening
  app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

