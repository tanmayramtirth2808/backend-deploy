const express = require('express');
const cors = require('cors');
const logger = require('./logger');
const encryptionMiddleware = require('./encryptionMiddleware');
const app = express();

app.use(cors('*'));

app.use(express.json());

app.use((request, response, next) => {
    logger.info(`Request: ${request.method} ${request.url}`, { headers: request.headers, body: request.body });
    
    const originalSend = response.send;
    response.send = function(body) {
        logger.info(`Response: ${response.statusCode} ${request.url}`, { body });
        originalSend.apply(response, arguments);
    };

    next();
});

//app.use(encryptionMiddleware);

app.use(express.static('public'));
app.use('/images', express.static('images'));

app.get('/', (request, response) => {
    response.send("App is running");
});

const userRouter = require('./routes/users');
const booksRouter = require('./routes/books');
const reviewsRouter = require('./routes/reviews');

app.use('/auth', userRouter);
app.use('/books', booksRouter);
app.use('/reviews', reviewsRouter);

app.listen(5000, () => {
    console.log('Server started on port 5000')
});
