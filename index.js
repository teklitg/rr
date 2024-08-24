const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =  'mongodb+srv://teklit:teklit@cluster0.9iy5i66.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// MongoDB Connection
mongoose.connect(MONGO_URI, {
    
    useUnifiedTopology: true

})
.then(()=>console.log("db connected"))
.catch(()=> console.log("db failed"))

// Image Model
const Image = mongoose.model('Image', new mongoose.Schema({
    url: String,
    filename: String,
}));

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Routes
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const image = new Image({
            url: req.file.path,
            filename: req.file.filename
        });
        await image.save();
        res.json(image);
    } catch (err) {
        res.status(400).json({ message: 'Error uploading image' });
    }
});



app.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching images' });
    }
});

// Catch-all handler for any request that doesn’t match the above routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
