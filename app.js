import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import expressLayout from 'express-ejs-layouts';
import  adminRoutes  from './server/routes/admin.js';
import mainRoutes, { insertPostData } from './server/routes/main.js';  // Import routes and insertPostData
import cookieParser from 'cookie-parser';
import mongoStore from 'connect-mongo';
import session from 'express-session';
import methodOverride from 'method-override';

const app = express();
const PORT = process.env.PORT || 5000;  // Correct port assignment

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser())

app.use(session({
  secret: 'keyboard cat',
  resave: 'false',
  saveUninitialized: 'true',
}))

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
  store: mongoStore.create({
  mongoUrl: process.env.MONGODB_URL='mongodb://localhost:27017/blog'})
}))



// Serve static files from the 'public' directory
app.use(express.static('public'));

// EJS Layout Setup
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Use the routes from main.js
app.use('/', mainRoutes);  // This correctly maps the routes from main.js
app.use(adminRoutes);
// Call insertPostData to insert posts into the DB once when the server starts
insertPostData();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





















// //jshint esversion: 6

// import dotenv from 'dotenv';
// dotenv.config();
// import express from 'express';
// import expressLayout from 'express-ejs-layouts';
// //import { connect } from 'mongoose';
// //import routes from './server/routes/main'
// import insertPostData from './server/routes/main.js';


// const app = express();
// const PORT = 5000 ||  process.env.PORT;

//  app.use(express.static('public'));

// //Templeting engine

// app.use('', insertPostData)
// app.use(expressLayout);
// app.set('layout', './layouts/main');
// app.set('view engine', 'ejs');


// insertPostData();


// //   import('./server/routes/main.js').then(insertPostData=> {
// //     app.use('/', insertPostData.default); 
// //  });
  


// app.listen(PORT, (req, res)=>{
//     console.log(`server running on port ${PORT}`)
// })