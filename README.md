# readme-repository

1. This is the result of the blog API backend.

2. About the project the project.

- The project focuses on creating a blog API with RESTFul routes for different models like user, category, and post with different operations such as GET, POST, PUT, and DELETE.
- The project has three parts: one backend and two frontends that can handle normal users, verified users, and an admin.
- The project implements protected routers that wouldn't allow users who aren't logged in or don't have the role to access them using passportJS and JWT tokens.

3. Project objectives

- [x] post model with the following fields title, author that has objectId of the user model, date, body, category objectId, tags, image_link, image_owner, image_source, privacy, comments with objectId
- With these fields, you can get information about the author who posted the post, the category in which the post was created, and which user posted a comment on the post. Last, by using privacy with a boolean value, the author can decide if the post is private or public.
- [x] category with a name field that can be added later after the post is created
- [x] user model with email, username, first_name, last_name, password, confirm_password, verified_status, admin
- By checking if the user is verified or not, same as the admin field, he can delete comments, publish or unpublish posts, delete the post, etc. Normal users can only read the posts and delete their comments.
- [x] comments model with content, date, like, user objectId, and hidden fields
- The comments model allows you to get information about who posted the comment, whether it has been liked or not, and a hidden field that is set to true, meaning the comment has been deleted.
- [x] setting up and defining the RESTFUL route controllers with Pug
- [x] testing these routes with CURL or Postman
- [x] creating protected routes with passportJS and JWT tokens by checking two different routers One is for the normal users that can log in to the frontend, and the other login router is for the verified users and the admins.
- Using the JWT token allows retrieving the payload from that token, depending on what is sent on the token. For this project, it is only the ID, verified_status, and admin fields.
- With PassportJS, I can check if the user exists in the database or not and send an error.
- The JWT is implemented using the Bearer schema, and if the token is successfully sent, it should get only the token, not the bearer. Since there are different implementations of this token for this project, I am using localStorage to save the token.
- [x] added backend tests to make sure every router and controller works.

4. Notes and lessons learned

- I learned how to think about the different relationships between the models that can solve a problem, for example, who is the author of the post.
- How to implement reliable routes using nouns instead of verbs with different operations like GET, POST, PUT, and DELETE
  \*Strengthen my knowledge using MongoDB to create, update, read, and delete records on the database. With that, I can understand a little better when to use find, findById, updateOne, findByIdAndUpdate, etc., and also when to use user req.params and req.body depending on the situation.
- How to use updateOne and set to update a field without changing the other fields on the object.
- How to implement a JWT token with PassportJS by checking if the frontend is sending an authorization header, then using JSON parse to get the token and see if it is undefined or not, and then sending back the token to the frontend.
- I learned how to implement PassportJS with an email and password since the default implementation is username and password.
- Learned how to configure multer and cloudinary to upload an image and retrieve it from the cloudinary.
- I learned how to make backend tests for every route for CRUD operations for user, post, comment, and category. Which allows us to test if each route and test work as intended and minimizes the chance for bugs later.

5. Features or things I'd love to work on in the future

- [ ] figure out if there is a way to not create a different router to update each field of the models.
- [ ] solves the problem of not uploading an image from the frontend to the backend and using Cloudinary to retrieve it and save it in the database.
- [ ] figure out how to check if there is the same comment on the post and not allow to create the same comment.
- [ ] figure out the problem with adding a splice to know which user ID to remove.
- [ ] figure out how to implement refreshing tokens or sessions.
- [ ] figure out how to create a middleware that I can accept or decline if I want the user to be verified or not.
- [ ] figure out how to delete a comment from both models.
