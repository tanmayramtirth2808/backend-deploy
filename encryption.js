const CryptoJS = require('crypto-js');

const secretKey = "Coreco@123"; 

function encryptData(data) {
    try {
        const encryptedText = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
        return encryptedText;
    } catch (error) {
        console.error('Encryption Error:', error);
        throw new Error('Error encrypting data');
    }
}

function decryptData(data) {
    try {
        console.log('Encrypted Data:', data);
        const bytes = CryptoJS.AES.decrypt(data, secretKey);

        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedData) {
            throw new Error('Failed to decrypt data');
        }

        console.log('Decrypted Data:', decryptedData);
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Decryption Error:', error);
        throw new Error('Error decrypting data');
    }
}

module.exports = { encryptData, decryptData };
