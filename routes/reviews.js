const express = require('express');
const router = express.Router();
const reviewsSchema  = require('../db');
const booksSchema  = require('../db');
const { verifyToken } = require('../tokenAuthenticator');
const mongoose = require('mongoose'); 

router.get('/book/:bookId', verifyToken, async(request, response) => {
        
    try {
        const bookId = request.params.bookId;
        
        const objectId = new mongoose.Types.ObjectId(bookId);

        const review = await reviewsSchema.reviews.find({ bookId: objectId });

        if (!review) {
            return response.status(404).json({ message: "No review found" });
        }
        
        response.status(200).json({ data: review });
    } catch (error) {
        console.error('Error fetching review:', error);
        response.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get('/:id', verifyToken, async(request, response) => {
    try {
        const id = request.params.id;
        const review = await booksSchema.reviews.findOne({ _id: id });

        if (!review) {
            return response.status(404).json({ message: "Review not found" });
        }

        response.status(200).json({ data: review });
    } catch (error) {
        response.status(500).send(error);
    }
});
router.post('/', verifyToken, async(request, response) => {
    try
    {
        const { bookId, content, userId } = request.body;

        if (!bookId) {
            return response.status(400).json({ message: 'bookId is required' });
        }

        if (!content) {
            return response.status(400).json({ message: 'Content is required' });
        }
        
        if (!userId) {
            return response.status(400).json({ message: 'userId is required' });
        }
        
        const book = await booksSchema.books.findOne({ _id: bookId });
        
        if (!book) 
        {
            return response.status(404).json({ message: "Book not found" });
        }
        
        const newReview = new reviewsSchema.reviews({
            bookId,
            content,
            userId
        });

        await newReview.save();
        response.status(200).json({ message: 'Review created successfully', data: newReview });
    } 
    catch (error) {
        response.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/:id', verifyToken, async(request, response) => {
    try   
    {
        const reviewId = request.params.id; 
        const { content } = request.body;

        const review = await reviewsSchema.reviews.findById(reviewId);
        if (!review) {
            return response.status(404).json({ message: 'Review not found' });
        }
    
        if (content) review.content = content;


        await review.save();
    
        response.status(200).json({ message: 'Review updated successfully', data: review });
    } 
    catch (error) {
        response.status(500).json({ message: 'Server error', error: error.message });
    }
    });

router.delete('/:id', verifyToken, async(request, response) => {
        try   
        {
            const reviewId = request.params.id; 
            
            const review = await reviewsSchema.reviews.findByIdAndDelete(reviewId);
        
            if (!review) {
                return response.status(404).json({ message: 'Review not found' });
            }
        
            
            response.status(200).json({ message: 'Review deleted successfully', data: review });
        } 
        catch (error) {
            response.status(500).json({ message: 'Server error', error: error.message });
        }
});


module.exports = router;