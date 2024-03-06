const { Feedback } = require("../models/feedback");
const express = require("express");
const router = express.Router();



router.get("/admin", async (req, res) => {
  // Check if the user is an Admin
  if (req.auth.role !== 'Admin') {
      return res.status(403).json({ success: false, message: "You are not authorized to access this resource." });
  }

  try {
      
      const feedbackList = await Feedback.find();
      
      if (!feedbackList || feedbackList.length === 0) {
          return res.status(404).json({ success: false, message: "No feedbacks Found." });
      }
      
      return res.status(200).send(feedbackList);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


router.post("/", async (req, res) => {
    userId= req.auth.userId;
  
    let feedback = new Feedback({
       
        user: userId,
        feedbackText: req.body.feedbackText,
        rating: req.body.rating,
        timestamp: req.body.timestamp
    });
    feedback = await feedback.save();
  
    if(!feedback) 
    {res.status(404).send(' feedback cannot be created!')
  return; }
  
    res.send(feedback);
  });
  router.get(`/`, async (req, res) => {
    userId= req.auth.userId;
    // userrole=req.auth.role
try {
    const feedbackList = await Feedback.find({user: userId});
    
    if (!feedbackList || feedbackList.length === 0) {
     return  res.status(400).json({ success: false , message: "No feedback found for this user."  });
    }
    return res.status(200).send(feedbackList);
  }catch{
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
  });


  router.get('/:id', async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);
    if(!feedback){
      return res.status(500).json({message: 'No Feedback with the given ID Not Found'})
    }
    res.status(200).send(feedback);
  });

  
  
  router.delete("/:id", (req, res) => {
    Feedback.findByIdAndDelete(req.params.id).then(feedback => { if (feedback){
      return res.status(200).json({success: true ,  messaage : 'feedback successfully removed'})
  }else {
       return res.status(404).json({success: false , message : 'feedback Not Found'})
  }}).catch(err=>{
      return res.status(400).json({success: false , error: err})
  })
  
  }
  )


  router.put('/:id', async (req, res) => {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,{
        
        feedbackText: req.body.feedbackText,
        rating: req.body.rating,
        timestamp: req.body.timestamp
      },
      {new : true}
    )
    if(!feedback) 
    {res.status(404).send('the feedback cannot be updated!')
    }
    res.send(feedback);
  })







module.exports = router;
