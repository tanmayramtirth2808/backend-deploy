const { encryptData, decryptData } = require('./encryption');

const encryptionMiddleware = (request, response, next) => {
    try {
        if (request.file || request.body.image) {
            console.log("File or image found, skipping decryption");
            next();
            return;
        }

        if (request.body.data) {
            request.body = decryptData(request.body.data);
        }

        console.log("Decrypted Request Body:", request.body);
    } catch (error) {
        return response.status(400).json({ message: 'Invalid encrypted request data' });
    }

    const originalResponse = response.send;
    response.send = async function (body) {
        try {
            const encryptedData = await encryptData(body);
            originalResponse.call(this, encryptedData);
        } catch (error) {
            return response.status(500).json({ message: 'Error encrypting response data' });
        }
    };

    next();
};

module.exports = encryptionMiddleware;
