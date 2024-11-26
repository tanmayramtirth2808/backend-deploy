const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const booksSchema = require('../db');
const { verifyAdminToken, verifyToken } = require('../tokenAuthenticator');
const { decryptData } = require('../encryption');

const storageDirectory = 'F:\\Coding Practice\\Angular-Node\\bookreviewsystem\\server\\images';
const relativeImagePath = 'images'; 

const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, storageDirectory);
    },
    filename: (request, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9); 
        cb(null, uniqueName + ext);
    } 
});

const upload = multer({ storage: storage });

router.get('/', verifyToken, async(request, response) => {
    try {
        const books = await booksSchema.books.find().sort({_id: -1 });

        if (!books || books.length === 0) {
            return response.status(404).json({ message: "No books found" });
        }

        response.status(200).json({ data: books });
    } catch (error) {
        response.status(500).send(error);
    }
});

router.get('/:id', verifyToken, async(request, response) => {
    try {
        const id = request.params.id;
        const book = await booksSchema.books.findOne({ _id: id });

        if (!book) {
            return response.status(404).json({ message: "Book not found" });
        }

        response.status(200).json({ data: book });
    } catch (error) {
        response.status(500).send(error);
    }
});

router.get('/title/:name', verifyToken, async (req, res) => {
    try {
      const title = req.params.name;
      
      const books = await booksSchema.books.find({ title: new RegExp(title, 'i') });
  
      if (books.length === 0) {
        return res.status(404).json({ message: "No books found" });
      }
  
      res.status(200).json({ data: books });
    } catch (error) {
      res.status(500).send(error);
    }
  });
  

  router.post('/', verifyAdminToken, upload.single('image'), async (request, response) => {
    try {
        console.log("Request Body before decryption:", request.body);

        if (request.body.data) {
            const decryptedString = decryptData(request.body.data);

            const decryptedData = JSON.parse(decryptedString);

            request.body = {
                ...decryptedData
            };
        }

        console.log("Request Body after decryption:", request.body);
        console.log("Request Body title:", request.body.title);
        console.log("Request Body description:", request.body.description);

        const { title, description } = request.body;

        if (!title) {
            return response.status(400).json({ message: 'Title is required' });
        }

        if (!description) {
            return response.status(400).json({ message: 'Description is required' });
        }

        let imagePath = null;
        if (request.file) {
            imagePath = path.join(relativeImagePath, request.file.filename).replace(/\\/g, '/');
        }

        const newBook = new booksSchema.books({
            title,
            description,
            imagePath  
        });
        await newBook.save();

        response.status(200).json({ message: 'Book created successfully', data: newBook });
    } catch (error) {
        console.error("Error in saving book:", error);
        response.status(500).json({ message: 'Server error', error: error.message });
    }
});



router.put('/:id', verifyAdminToken, upload.single('image'), async(request, response) => {
    try {
        const bookId = request.params.id; 
        const { title, description } = request.body;

        const book = await booksSchema.books.findById(bookId);
        if (!book) {
            return response.status(404).json({ message: 'Book not found' });
        }

        if (title) book.title = title;
        if (description) book.description = description;

        if (request.file) {
            book.imagePath = path.join(relativeImagePath, request.file.filename).replace(/\\/g, '/'); 
        }

        await book.save();
    
        response.status(200).json({ message: 'Book updated successfully', data: book });
    } catch (error) {
        response.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/:id', verifyAdminToken, async(request, response) => {
    try {
        const bookId = request.params.id; 
        const book = await booksSchema.books.findByIdAndDelete(bookId);

        if (!book) {
            return response.status(404).json({ message: 'Book not found' });
        }

        response.status(200).json({ message: 'Book deleted successfully', data: book });
    } catch (error) {
        response.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
