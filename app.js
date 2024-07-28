const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const multer = require('multer');
const { check, validationResult } = require('express-validator');

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse form data
app.use(express.urlencoded({ extended: false }));

// Session middleware setup
app.use(
  session({
    secret: 'this is my secret', // Replace with a secure secret in production
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 60000 }, // Session expires in 1 minute
  })
);

// Flash middleware initialization
app.use(flash());

// Multer storage configuration
const filestore = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
    //   cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  app.use(multer({ storage: filestore }).single('image'));

// Serve static files from the "images" directory
app.use('/images', express.static(path.join(__dirname,'images')));

// GET route to render the form
app.get('/', (req, res) => {
 res.sendFile(path.join(__dirname,'index.html')); // Render view with flash messages
});

// POST route to handle form submission and file upload
app.post(
  '/auth',
  [
    // Validate the "name" field
    check('name', 'The Username must contain at least 5 characters!').isLength({ min: 5 }),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Log validation errors for debugging
      console.log(errors.array());

      // Store error message in flash and redirect
      const err = errors.array()[0].msg;
      req.flash('err', err);
      return res.redirect('/');
    }

    let name = req.body.name;
    let image = req.file;

    if (!image) {
      req.flash('err', 'Please upload an image.');
      return res.redirect('/');
    }

    console.log('Uploaded image:', image);

    // Render the final view with uploaded image information
    res.render('final', { name: name, path: image.path });
  }
);

// Start the server on port 8080
app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
