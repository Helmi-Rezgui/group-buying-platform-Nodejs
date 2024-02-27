function errorHandler(err,req,res,next){
    if(err.name === 'UnauthenticatedError'){
        //jwt auth error
        //TODO:
        res.status(403).json({message:'User is not authorized'});
    }

    if(err.name === 'ValidationError'){
        //validation error
        res.status(403).json({message:err});
    }
    // default error
    return res.status(500).json(err);
}




module.exports= errorHandler; 