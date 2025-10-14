const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const MONGODB_URL = "mongodb://127.0.0.1:27017/vandanest";

main().then(() => {
    console.log('Database connection established');
})
    .catch(err => {
        console.error('Database connection error:', err);
    });

async function main() {
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // to parse form data
app.use(methodOverride('_method')); 
app.engine('ejs', ejsMate); 
app.use(express.static(path.join(__dirname, 'public'))); 


app.get('/', (req, res) => {  // defines what to do when a request comes
    res.send('Hi, I am root');
});

// Index route -> to show all listings
app.get('/listings', async (req, res) => {
   const allListings =  await Listing.find({});
   res.render('listings/index.ejs', {allListings});
});

// New route -> to create a new listing {form}
app.get('/listings/new', (req, res) => {
    res.render('listings/new.ejs');
});

// Create route -> to add the new listing to the database
app.post('/listings', async (req, res) => {
    // let {title, description, price, location, images, country} = req.body.listing;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect(`/listings`);
});

// Show route -> to show details of a specific listing
app.get('/listings/:id', async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/show.ejs', {listing}); 
});

// Edit route -> to edit a specific listing {form}
app.get('/listings/:id/edit', async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', {listing});
});

// Update route -> to update the edited listing in the database
app.put('/listings/:id', async (req, res) => {
    let {id} = req.params;
        const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, {new: true});
    res.redirect(`/listings/${updatedListing._id}`);
}); 

// Delete route -> to delete a specific listing from the database
app.delete('/listings/:id', async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log('Deleted Listing:', deletedListing);
    res.redirect('/listings');
});

// app.get('/testlistings', async (req, res) => {  
//     let sampleListing = new Listing({
//         title: "Cozy Cottage",
//         description: "A cozy cottage in the countryside.",
//         price: 1200,
//         location: "Countryside, USA",
//         // images: "",
//         country: "Wonderland"
//     });
//     await sampleListing.save();
//     console.log('Sample listing saved to database');
//     res.send('Listing created and saved to database');
    
// });

app.listen(8080, () => { // turns the server on and starts waiting for requests
    console.log('Server is running on port 8080');
});