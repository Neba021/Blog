import express from 'express';                                     
import post from '../models/Post.js'; 
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();  // Load environment variables from .env file

import jwt from 'jsonwebtoken';
import Post from '../models/Post.js';

const router = express.Router();

// Layout for the admin pages
const adminLayout = '../views/layouts/admin.ejs';
const jwtSecret = process.env.JWT_SECRET;


//CHECK LOGIN
   const authMiddleware = (req, res, next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message: 'unauthorized'})
    }
try{
    const decoded = jwt.verify(token, jwtSecret)
    req.userId = decoded.userId;
    next()
} catch(error){
    return res.status(401).json({message: 'unauthorized'})
}
   }

// Admin route without the trailing space
router.get('/admin', async (req, res) => {
 // console.log("Admin route accessed!");
  try {
      const locals = {
          title: 'Admin',
          description: 'Admin page'
      };

      res.render('admin', { locals, layout: adminLayout });
  } catch (error) {
      console.error(error);
  }
});


router.post('/admin', async (req, res) => {
   
    try {
          const {username, password} = req.body;
          const user = await User.findOne({username})
          const isPasswordValid = await bcrypt.compare(password, user.password)
          const   token = jwt.sign({userId: user._id}, jwtSecret)
          res.cookie('token', token, {httponly: true})

          if(!user){
            return res.status(401).json({message: 'invalid credentials'})
          }

          if(!isPasswordValid){
            return res.status(401).json({message: 'invalid credentials'})
          }
         
          res.redirect('/dashboard')
         
    } catch (error) {
        console.log(error);
    }
  });


router.get('/dashboard',  authMiddleware, async (req, res) => {
    try{
const locals = {
    title: 'Dashboard',
    description: 'admin dashbord'
}

const data = await Post.find();

res.render('admin/dashboard',{
    locals,
    data,
    layout: adminLayout
})

}catch(error){
    console.error(error);
    }
    
  })
/// admin create new post 

router.get('/add-post',  authMiddleware, async (req, res) => {
    try{
const locals = {
    title: 'Add Post',
    description: 'admin dashbord'
}

const data = await Post.find();

res.render('admin/add-post',{
    locals,
    layout: adminLayout
})

}catch(error){
    console.error(error);
    }
    
  })


// Add post with tags
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    
    // Split the tags by commas and trim any spaces
    const tagArray = tags.split(',').map(tag => tag.trim());

    const newPost = new Post({
      title,
      body,
      tags: tagArray
    });

    await Post.create(newPost);
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error creating post');
  }
});



router.get('/edit-post/:id',  authMiddleware, async (req, res) => {
  try{
      
          const locals = {
          title: 'Edit Post',
          description: 'just edit page'
       }
        const data = await Post.findOne({_id: req.params.id})
     
         res.render('admin/edit-post', {
              locals,
                data,
              layout: adminLayout

       })
}

    catch(error){
        console.error(error);
  }
  })



// edit

router.put('/edit-post/:id',  authMiddleware, async (req, res) => {
  try{
    
       await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
       })

       res.redirect(`/edit-post/${req.params.id}`)
}

catch(error){
  console.error(error);
  }
  })



  router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
      const postId = req.params.id;
  
      // Delete the post by ID
      const deletedPost = await Post.findByIdAndDelete(postId);
  
      if (!deletedPost) {
        return res.status(404).send('Post not found');
      }
  
      // Redirect after successful deletion (e.g., to the list of posts)
      res.redirect('/dashboard'); // Replace '/posts' with the appropriate path
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });



  router.get('/logout', (req, res) => {
    // Clear the cookie by setting the token to an empty value and making it expire
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    
    // Redirect the user to the login page or home page
    res.redirect('/admin');  // You can redirect to any page like the login page
});




// admin register

  router.post('/register', async (req, res) => {
   
    try {
      const {username, password} = req.body;
       const hashPassword = await bcrypt.hash(password, 10);
          
  
           
       try{
         const user = await User.create({username, password: hashPassword});
         res.status(201).json({message: 'User Created', user})
         res.redirect('/register')
       }
       catch(error){
                 if (error.code === 11000) {
                 // res.render('/register', 'user alrady exsist') 
                 res.status(409).json({message: 'user alrady exsist'})
                 }else{
                    res.status(500).json({message: 'internal server error'})
                 }

       }
        
    } catch (error) {
        console.error(error);
    }
  });
  




export default router;
