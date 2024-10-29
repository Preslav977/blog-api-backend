#blog-api-backend

# Overview

This is the API or server side of the project that is communicating with the front-end utilizing MongoDB with Mongoose.

# About the project the project

The Blog API project is around bulgarian culture, and it focuses on restful routes. The user can fetch posts depending on the router he or she is on. Some routes are protected with Passport JS and JWT, and it requires the user to log in. There is also a guest account, which bypasses the need to create an account.

# Features

- Filter posts by ID
- Filter posts by tag
- Filter posts by category
- Add a comment.
- Delete a comment.
- Create a post.
- Add post category
- Update the privacy of the post.
- Delete a post.
- Live validation when signing up or logging up.
- Guest account

# Technology Used

- MongoDB: modeling the schemas and relationships between user, comment, post, and category
- Mongoose: that provides a schema-based solution for the application data
- Express: provides a robust set of features for web applications
- Node: for allowing the use of modules, reading or writing for files
- Passport JS: authentication and authorization for the user, depending on the role
- Bcrypt: module that converts plan text passwords into hashes using algorithms
- JWT token: that is generated on log in. In order to validate the user
- MongoDB Memory Server: library that is used for testing the routes and controllers

# Lessons Learned

- MongoDB: learned how to think about the different relationships between the models that can solve a problem, for example, who is the author of the post.
- Restful API: how to implement reliable routes using nouns instead of verbs with different operations like GET, POST, PUT, and DELETE
- Mongoose Queries: strengthening my knowledge with create, update, read, and delete records on the database. With that, I can understand a little better when to use find, findById, updateOne, findByIdAndUpdate, etc., and also when to use user req.params and req.body depending on the situation.
- JTW token: utilizing PassportJS by checking if the frontend is sending an authorization header, then using JSON parse to get the token and see if it is undefined or not, and then sending back the token to the frontend.
- Passport Local Strategy: learned how to implement PassportJS with an email and password since the default implementation is username and password.
- MongoDB Memory Server: how to make backend tests for every route for CRUD operations for user, post, comment, and category. Which allows us to test if each route and test work as intended and minimizes the chance for bugs later.

# Future Improvements

- Creating different routers to update each field of the models
- Figure out how to upload an image with multer
- Solve the problem with each post having its own comment without checking if the same comment exists for all posts.
- How to utilize Splice to remove the comment from the post
- How to implement refreshing tokens
- How to delete comments from comments and user models
