const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

router.get("/verify-email", async (req, res) => {
  const token = req.query.token;
  console.log(token);
  

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const userId = decoded.userId;
 // Check if the token has been used before
    const user = await User.findById(userId);
    if (user.isVerified) {
      return res.status(400).send("Email already verified.");
    }
    
    // Mark user's email as verified
    await User.findByIdAndUpdate(userId, { isVerified: true });
  res.send("Email verified successfully. you can now close this page and log in ")

 
  } catch (error) {
    
      return res.status(400).send("Invalid or expired token.");
  }
});

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
// creating new user
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
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
router.post("/register", async (req, res) => {
  
    let existingUser  = await User.findOne({ email: req.body.email });
  if (existingUser ) {
    return   res.status(400).json({
      "success":false , "message":"Email already exists. Please use a different email."
    });
  }


  
    const user = new User({
    name: req.body.name,
    lastName: req.body.lastName,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10), //the "10" is a salt of bcrypt
    phone: req.body.phone,
    role: req.body.role,
    isVerified: false,
  })
  ;
  // Save user to the database
  await user.save();
  try {

    // Send verification email
    const verificationToken = jwt.sign({ userId: user.id }, process.env.SECRET, { expiresIn: '1d' });
    const verificationLink = `http://localhost:3000/api/v1/users/verify-email?token=${verificationToken}`;
    console.log(verificationLink);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Email Verification",
      html: `Click <a href="${verificationLink}">here</a> to verify your email.`,
    });

    res.status(201).json({"success":true,
    "message":"User registered successfully. Please check your email for verification."
  });
  } catch (error) {
    console.error(error);
    res.status(400).json({success:false,
      "message":"User registration failed."});
  }
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
if (!user.isVerified) {
  return res.status(403).send('Email not verified. Please verify your email before logging in.')}

  if(user&& bcrypt.compareSync(req.body.password, user.passwordHash)){
    const token = jwt.sign({
       userId: user.id,
       role:user.role
       
    },
    secret,
    {expiresIn:'1d'})
    res.status(200).send({user : user.email , token : token})
  }else{
    res.status(400).send('Invalid email or password')
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
