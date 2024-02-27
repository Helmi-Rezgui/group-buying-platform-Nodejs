const {Order}= require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const { Users } = require('../routes/users');
const { JWT } = require('../helpers/jwt');
const router = express.Router();
const jwt = require("jsonwebtoken");





router.get(`/`, async (req, res) =>{
    const orderList =await Order.find().populate('user', 'name').sort({'dateOrdered':-1});
    if(!orderList){
        res.status(500).json({success : false})
    }
    res.send(orderList);
})

router.get(`/:id`, async (req, res) =>{
    const order =await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({path:'orderItems', populate:'product'});
    if(!order){
        res.status(500).json({success : false})
    }
    res.send(order);
})
router.post(`/`, async(req,res)=>{
    
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem=  new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem= await newOrderItem.save();
        return newOrderItem._id;
    }))
    const orderItemsIdsResolved = await orderItemsIds;
    const totalPrices = await  Promise.all(orderItemsIdsResolved.map( async orderItemId=>{
const orderItem = await OrderItem.findById(orderItemId).populate('product','price')
const totalPrice=orderItem.product.price * orderItem.quantity;
return totalPrice
    }))
    const totalPrice = totalPrices.reduce((a,b)=>a+b ,0);
    
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.secret, async (err, decodedToken) => {
        if (err) {
            // Handle token verification error
            return res.status(401).json({ success: false, message: 'Invalid token' });
        } else {
            // Extract user ID from decoded token
            const userId = decodedToken.userId;
    let order = new Order({
        orderItems:  orderItemsIdsResolved,
        shippingAddress:  req.body.shippingAddress,
        zip:  req.body.zip,
        phone:  req.body.phone,
        status:  req.body.status,
        totalPrice: totalPrice,
        user:  userId,
    })
   order= await order.save();
   if (!order){
    return res.status(500).json({success: false, message:'order cannot be created'});
   }
   res.send(order);
        }
})
})




router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
      req.params.id,{
        status: req.body.status,
       
      },
      {new : true}
    )
    if(!order) 
    {res.status(404).send(' order cannot be updated!')
    }
    res.send(order);
  })
  
router.delete('/:id',  (req , res) => {
    Order.findByIdAndDelete(req.params.id).then(async order => { if (order){
        await order.orderItems.map(async orderItem=>{
            await OrderItem.findByIdAndDelete(orderItem)
        })
      return res.status(200).json({success: true ,  messaage : 'order successfully removed'})
  }else {
       return res.status(404).json({success: false , message : 'order not found'})
  }}).catch(err=>{
      return res.status(400).json({success: false , error: err})
  })
  
  }
  )

  //for getting stats of all sales in the shop
router.get('/get/totalsales',async  (req, res)=>{
const totalSales = await Order.aggregate([
    {$group: {_id: null , totalsales : {$sum: '$totalPrice'}}}
])
if(!totalSales){
    return res.status(400).send('The order sales cannot be generated')
}
res.send({totalsales: totalSales.pop().totalsales})

})



//getting count of all orders of the shop
router.get('/get/count', async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();
        if (!orderCount) {
            return res.status(500).json({ success: false });
        }
        res.send({ count: orderCount });
    } catch (error) {
        
        res.status(500).json({ success: false });
    }
});

//user history of orders
router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList =await Order.find({user: req.params.userid}).populate({path:'orderItems', populate:'product'}).sort({'dateOrdered':-1});
    if(!userOrderList){
        res.status(500).json({success : false})
    }
    res.send(userOrderList);
    
})


module.exports = router;