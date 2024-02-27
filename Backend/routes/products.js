const { Category } = require('../models/category');
const {Product}= require('../models/product');

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

//file upload 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('invalid image type');
      if(isValid) {
        uploadError = null
      }
      
      cb(uploadError, 'public/uploads')
    }
    , filename: function (req, file, cb) {
      
      const filename = file.originalname.toLowerCase().split(' ').join('-'); 
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${filename}-${Date.now()}.${extension}`);
    }
  })
  const uploadOptions = multer({storage: storage})







router.get(`/`, async (req, res) => {
    //localhost:3000/api/v1/products?categories=2342342,123354
    //Filtering products by category
    try {
    let filter = {}
    if (req.query.categories){
        filter ={category : req.query.categories.split(',') }
    }
    console.log(filter)
    const  productList = await Product.find(filter).populate('category'); //.select('name image -_id');
    if (!productList){
        res.status(404).json({"success":false , message :'no product within this category is found '}); 
    }
    res.send(productList);
  }catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
})
router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');//.select('name image -_id');
    if (!product){
        res.status(500).json({"success":false});
    }
    res.send(product);
})
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  // Trying a wrong category id will work only if the id contain 24 characters(as its in the DB)
   const category = await Category.findById(req.body.category);
   if(!category) return res.status(400).send('Invalid category')
   
   //file upload
   const file = req.file;
   if (!file) return res.status(400).send('No image in the request')

  
 const filename = req.file.filename;
 const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
  

    let product = new Product({
       
       name : req.body.name,
       description : req.body.description,
       quantity : req.body.quantity,
       image : `${basePath}${filename}`, //"http://localhost:3000/public/uploads/image-232323"
       images : req.body.images,
       brand : req.body.brand,
       price : req.body.price,
       timing : req.body.timing,
       category : req.body.category,
       isFeatured : req.body.isFeatured
    })
      product = await product.save();
    
    if (!product)
        return res.status(500).send('product cannot be created');
     res.send(product);  
})



router.put('/:id', async (req, res) => {
    
   if (!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).send('Invalid Product Id')
   }
    //TODO: SAME OTHER TO DO EROOR
    const category = await Category.findById(req.body.category);
   if(!category) return res.status(400).send('Invalid category')
    const product = await Product.findByIdAndUpdate(
      req.params.id,{
        id : req.body.id,
       name : req.body.name,
       description : req.body.description,
       quantity : req.body.quantity,
       image : req.body.image,
       images : req.body.images,
       brand : req.body.brand,
       price : req.body.price,
       timing : req.body.timing,
       category : req.body.category,
       isFeatured : req.body.isFeatured 
      },
      {new : true}
    )
    if(!product) 
    {res.status(404).send('the product cannot be updated!')
     return; }
    res.send(product);
  })


  router.delete('/:id',  (req , res) => {
    Product.findByIdAndDelete(req.params.id).then(product => { if (product){
      return res.status(200).json({success: true ,  messaage : 'product successfully removed'})
  }else {
       return res.status(404).json({success: false , message : 'product not found'})
  }}).catch(err=>{
    
      return res.status(400).json({success: false , error: err})
  })
  
  }
  )

  // DB Product Counter
  router.get('/get/count', async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        if (!productCount) {
            return res.status(500).json({ success: false });
        }
        res.send({ count: productCount });
    } catch (error) {
        
        res.status(500).json({ success: false });
    }
});

//Getting only the products that are displayed in the homepage
  router.get(`/get/featured`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
        const products = await Product.find({isFeatured : true})
        if (!products) {
            return res.status(500).json({ success: false });
        }
        res.send(products );
    }
  );
  //get only number chosen featured product 
  router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
        const products = await Product.find({isFeatured : true}).limit(+count)
        if (!products) {
            return res.status(500).json({ success: false });
        }
        res.send(products );
    }
  );
  router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)){
      return res.status(400).send('Invalid Product Id')
     }
     const files = req.files;
     let imagespaths = [];
     const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
     if(files){
      files.map(file => {
        imagespaths.push(`${basePath}${file.filename}`);
     })
    }
    
     const product = await Product.findByIdAndUpdate(
       req.params.id,{
         images : imagespaths
       }
       ,{new : true}

     )
     if(!product)
     {res.status(404).send('the product cannot be updated!')
      return; }
      res.send(product);
  })


module.exports = router;