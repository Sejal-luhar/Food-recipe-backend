const mongoose=require('mongoose')

mongoose.connect(process.env.MONGOURL)
.then(()=>{
    console.log('Database Connected Succesfully');
    
})
.catch((err)=>{
    console.log(err.message);
    
})