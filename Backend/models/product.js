const mongoose = require('mongoose');



//FIXME:
const productSchema = mongoose.Schema({
    
    name: {type :String,
        required: true},
    description: {type :String,
        required: true},
        image: {type :String,
            required: true},
        images: [{type :String,
            required: false}],
        brand: {type :String,
                required: false},
            price: {
        type :Number, 
        required: true},

            quantity: {
        type :Number, 
        required: true},
            timing: {
        type :Number, 
        required: true},
        
        isFeatured:{//TO be displayed in the home page ?
            type: Boolean, 
            default: false,
        },
            category: {
        type :mongoose.Schema.Types.ObjectId, 
        ref: 'category',
        required: true},
        dateCreated: {
            type :Date, 
            default: Date.now()},
})
productSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
productSchema.set('toJSON',{
    virtuals : true,
});
        exports.Product = mongoose.model('Products',productSchema);

