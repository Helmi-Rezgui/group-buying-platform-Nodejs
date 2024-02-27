const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


router.get(`/`, async (req, res) => {
  const userList = await User.find().select('-passwordHash');
  if (!userList) {
    return res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get("/:id", async (req, res) => {
  let user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.send(user);
});
//creating new user
router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    lastName: req.body.lastName,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10), //the "10" is a salt of bcrypt
    phone: req.body.phone,
    role: req.body.role,
  });
  user = await user.save();
  if (!user) return res.status(400).send("user cannot be created");
  res.send(user);
});
router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    lastName: req.body.lastName,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10), //the "10" is a salt of bcrypt
    phone: req.body.phone,
    role: req.body.role,
  });
  user = await user.save();
  if (!user) return res.status(400).send("user cannot be created");
  res.send(user);
});
router.put("/:id", async (req, res) => {
  let user = await User.findByIdAndUpdate(req.params.id,
  
    {
      name: req.body.name,
      lastName: req.body.lastName,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10), //the "10" is a salt of bcrypt
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
    },
    { new: true }
  );
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "invalid user id " });
  }
  res.send(user);
});




//Auth 
router.post('/login', async (req, res) => {
const user = await User.findOne({email: req.body.email})
const secret = process.env.secret
if (!user) {
  return res.status(404).send('User not found')}

  if(user&& bcrypt.compareSync(req.body.password, user.passwordHash)){
    const token = jwt.sign({
       userId: user.id,
       role:user.role
       
    },
    secret,
    {expiresIn:'1d'})
    res.status(200).send({user : user.email , token : token})
  }else{
    res.status(400).send('wrong password')
  }
} )

  
router.delete('/:id',  (req , res) => {
  User.findByIdAndDelete(req.params.id).then(user => { if (user){
    return res.status(200).json({success: true ,  messaage : 'user successfully removed'})
}else {
     return res.status(404).json({success: false , message : 'user not found'})
}}).catch(err=>{
  
    return res.status(400).json({success: false , error: err})
})

}
)
  router.get('/get/count', async (req, res) => {
    
        const userCount = await User.countDocuments();
        if (!userCount) {
            return res.status(500).json({ success: false });
        }
        res.send({ count: userCount });
    
});


  











module.exports = router;
