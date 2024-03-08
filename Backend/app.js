const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv/config');
const authJwt = require('./helpers/jwt');

const api= process.env.API_URL;

// swagger
// const swaggerjsdoc= require('swagger-jsdoc');
// const swaggerui= require('swagger-ui-express');

//Routes
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');
const errorHandler= require('./helpers/error-handler')
const feedbacksRouter= require('./routes/feedbacks')



//middleware
app.use(bodyParser.json());
app.use(authJwt());
app.use(errorHandler);
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));



app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/feedbacks`, feedbacksRouter);
// const options={
//     definition:{ 
//         openapi:"3.0.0",
//         server:[
//             {
//                 url:"http://localhost:3000/api/v1/",
//             }
//         ]
//       },
//       apis:["./routes/*.js"]
// }




mongoose.connect('mongodb://localhost:27017/eshop')
.then(() => {
    console.log('DB connection is ready...');
})
.catch(err => {
    console.log(err);
})




// const spacs= swaggerjsdoc(options)
// app.use(
//     "/api-docs",
//     swaggerui.serve,
//     swaggerui.setup(spacs,
//         {explorer: true, swaggerUrl: '/swagger/v1/swagger.json'}));
    

app.listen(3000, () => {
    console.log(api);
    console.log('Server is running on port 3000');
});
