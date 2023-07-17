//    we run this file anytime w want to see our database rather than directly using it in app.js
const mongoose=require('mongoose');

const CampGround=require('../models/campground')
const cities=require('./cities');
const {places,descriptors }=require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('Database Connected!!!')
    })
    .catch(err => {
        console.log("Ohh No!!! Database connection error!!!");
        console.log(err);
    })

const makeRandomElement=(array)=>{
    return (
        array[Math.floor(Math.random()*array.length)+1]
    )
}    


const seedsDB=async()=>{
    await CampGround.deleteMany({});
    const randomPrice=Math.floor(Math.random()*20)+10;
    for(let v=0;v<50;v++){
        const newGround=new CampGround({
            author:'64b10aa2ec5974a3a65fe5a6',
            location:`${makeRandomElement(cities).city},${makeRandomElement(cities).state}`,
            title:`${makeRandomElement(places)},${makeRandomElement(descriptors)}`,
            image:"https://source.unsplash.com/collection/483251",
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Est ex inventore nostrum? Excepturi fugit consectetur laborum quo sed, rerum repellat nesciunt incidunt alias ad voluptatibus quos quam corrupti! Laudantium aspernatur cum iusto ipsum in quaerat dicta quisquam iste, praesentium ratione?",
            price:randomPrice,
           
        })
        await newGround.save()
    }


} 
//  seedsDB().then(()=>{
//      mongoose.connection.close();
//  });   
seedsDB();