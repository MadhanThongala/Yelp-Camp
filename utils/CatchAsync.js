// const CatchAsync=func=>{
//     return (req,res,next)=>{
//         func(req,res,next).catch(next);
//     }

// }
// module.exports=CatchAsync


//   Or the Above function can be written as Just for showing how exports and imports works for more sww seeds folder

module.exports=func=>{
    return (req,res,next)=>{
        func(req,res,next).catch(next);
    }

}
