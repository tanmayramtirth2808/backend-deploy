const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/bookreview')
    .then(() => {
        console.log('Connected to MongoDB');
      })
      .catch((error) => {
        console.error('Connection error:', error);
      });

const usersSchema = new mongoose.Schema({
username: String,
password: String,
role: String,
image: String
})

const users = mongoose.model('users', usersSchema);

const booksSchema = new mongoose.Schema({
title: String,
password: String,
description: String,
imagePath: String
})

const books = mongoose.model('books', booksSchema);

const reviewsSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'books', required: true },  
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
});

const reviews = mongoose.model('reviews', reviewsSchema);

module.exports = {
    users, books, reviews,
}