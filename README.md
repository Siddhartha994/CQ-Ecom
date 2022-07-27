# CQ-Ecom

login with 
username: sira,username: sira for admin access
create products, 

E-Commerce App 
-- Server-side rendering using EJS
--Express-router for organized code structure
--crypto for generating temporary random number
--Node-mailer for sending reset password link
-- Multer for handling multipart/form-data
-->User Types: Admin & user 
/\/\/\Admin:
1.create entry for new products
2.update product details (quantity)
3. admin-only actions priveleged via middleware route
/\/\/\/\User: 
--authentication for signup, login
--reset password via verified email(node-mailer)
--session based auth.
--view products, maintain cart
