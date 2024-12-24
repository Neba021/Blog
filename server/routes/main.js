import express from 'express';
import connectDB from '../config/db.js';  // Import the database connection function
import post from '../models/Post.js';  // Import the post model
import Comment from '../models/Comment.js';


const router = express.Router();

// Route to render the home page (index.ejs)
router.get('', async (req, res) => {
  try {
    const locals = {
      title: "TechTonic Tribe",
      description: "A vibrant tech community based in DBU."
    };

    const perPage = 6;  // Number of posts per page
    let page = parseInt(req.query.page) || 1;  // Default to page 1 if no page query is provided
    const skip = perPage * (page - 1); // Skip the correct number of posts

    // Use aggregate pipeline to fetch posts and calculate total count
    const [data, totalCount] = await Promise.all([
      post.aggregate([
        { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
        { $skip: skip },              // Skip the appropriate number of documents
        { $limit: perPage },          // Limit the number of posts per page
      ]),
      post.countDocuments()          // Get the total count of posts
    ]);

    // Calculate the next page number and check if there's a next page
    const nextPage = page + 1;
    const hasNextPage = nextPage <= Math.ceil(totalCount / perPage);

    // Render the view with the pagination data
    res.render('index', {
      locals,
      data,
      current: page,               // Current page number
      nextPage: hasNextPage ? nextPage : null, // Next page (if exists)
      currentRoute: '/'            // Current route (for potential links)
    });
    
  } catch (error) {
    console.error("Error fetching posts:", error);  // Log the error for debugging
    res.status(500).send("Server Error");  // Return a 500 server error response
  }
});


// Function to insert data into the database
export const insertPostData = async () => {
  try {
    // Establish the MongoDB connection
    await connectDB();

    const existingPosts = await post.countDocuments(); // Check if any posts already exist

    if (existingPosts === 0) {
      // Define the posts to be inserted
      const posts = [
        { title: "Building a Blog", body: "This is the body text" },
        { title: "Getting Started with Node.js", body: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine." },
        { title: "Understanding MongoDB", body: "MongoDB is a NoSQL database that uses a flexible, document-oriented data model." },
        { title: "Exploring Express.js", body: "Express.js is a web application framework for Node.js, designed for building APIs and web applications." },
        { title: "Introduction to Mongoose", body: "Mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js." },
        { title: "Setting up a REST API", body: "A REST API allows communication between different applications using HTTP requests." },
        { title: "Deploying Your Node.js App", body: "You can deploy your Node.js application using services like Heroku, AWS, or DigitalOcean." },
        { title: "Security Best Practices in Node.js", body: "Ensure that your Node.js application is secure by using HTTPS, sanitizing input, and handling errors gracefully." },
        { title: "Optimizing Performance in Node.js", body: "Node.js is fast, but performance can be further improved by managing asynchronous operations and optimizing memory usage." },
        { title: "Testing with Mocha and Chai", body: "Mocha and Chai are popular testing libraries in the Node.js ecosystem for unit and integration tests." },
      ];

      // Insert multiple posts at once
      await post.insertMany(posts);
      console.log("Post data inserted successfully");
    } else {
      console.log("Posts already exist in the database."); // If posts exist, log a message
    }
  } catch (err) {
    console.error("Error inserting posts:", err); // Log error if insertion fails
  }
};


router.get('/post/:id', async (req, res) => {
  try {
    const locals = {
      title: "Techthonic tribe",
      description: "h"
    };

    const slug = req.params.id;

    // Fetch the post using the post ID
    const data = await post.findById(slug);

    // Fetch the comments related to this post
    const comments = await Comment.find({ postId: slug });

    res.render('post', {
      locals,
      data,
      comments,  // Pass the comments to the view
      currentRoute: `/post/${slug}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching post or comments');
  }
});


router.get('/about', (req, res) => {
  res.render('about');  // Renders the 'about.ejs' template
});


router.post('/post/:id/comment', async (req, res) => {
  try {
    const { content, author } = req.body;  // Get the comment content and author from the form

    // Set author to 'Anonymous' if it's not provided
    const commentAuthor = author || 'Anonymous';

    // Create a new comment
    const newComment = new Comment({
      content,
      author: commentAuthor,
      postId: req.params.id,  // Link comment to the specific post
    });

    // Save the comment to the database
    await newComment.save();

    // Redirect back to the post page after submitting the comment
    res.redirect(`/post/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding comment');
  }
});



router.post('/search', async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Search posts by title, body, or tag"
    };

    const searchTerm = req.body.searchTerm;
    const removeSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, ""); // Clean the search term

    // Search posts by title, body, or tags
    const data = await post.find({
      $or: [
        { title: { $regex: new RegExp(removeSpecialChar, 'i') } }, // Search by title
       // { body: { $regex: new RegExp(removeSpecialChar, 'i') } },   // Search by body
        { tags: { $regex: new RegExp(removeSpecialChar, 'i') } }    // Search by tags
      ]
    });

    res.render('search', {
      data,
      locals
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});


export default router;
