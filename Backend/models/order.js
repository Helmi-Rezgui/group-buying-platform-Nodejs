const mongoose = require('mongoose');
const { User } = require('./user');






const orderSchema = mongoose.Schema({
    orderItems:[{
        type :mongoose.Schema.Types.ObjectId, 
        ref: 'OrderItem',
        required: true}],
        shippingAddress: {
            type:String,
            required: true
        },
        zip:{
        type:Number,
        required: true
        },
        phone:{
        type:Number,
        required: true
        },
        status:{
        type:String,
        required: true,
        default:"pending"
        },
        totalPrice:{
        type:Number
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
    },
    dateOrdered:{
        type:Date,
        default:Date.now()
    }
})
orderSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
orderSchema.set('toJSON',{
    virtuals : true,
});
        exports.Order = mongoose.model('Order',orderSchema);

