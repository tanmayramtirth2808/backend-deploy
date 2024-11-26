const express = require('express');
const router = express.Router();
const usersSchema = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mailer = require('../mailer');
const { verifyToken } = require('../tokenAuthenticator');
// const { encryptData, decryptData } = require('../encryption');
// const encryptionMiddleware = require('../encryptionMiddleware');

const jwt_secrect_code = 'Coreco@123$';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', async(request, response) => {
    
    const { username, password } = request.body;
    
    // if(!username || !password)
    // {
    //     return response.status(404).json({message: 'Username and password are required'})
    // }

    // const encryptedPassword = await bcrypt.hash(password, 10);

    // try
    // {
    //     const newUser = new usersSchema.users({
    //         username,
    //         password: encryptedPassword,
    //         role: 'user',
    //         image: ''
    //     });

        //await newUser.save();
        
        response.status(200).json({ message: 'User registered successfully' });
    }
    // catch(error)
    // {
    //     console.log('Error registering user:', error);
        
    //     response.status(500).json({ error: 'Internal Server Error' });
    // }
// }
)


router.post('/login', async(request, response) => {
    const { username, password } = request.body;
    
    if(!username || !password)
    {
        return response.status(404).json({message: 'Username and password are required'})
    }

    try 
    {
        //const user = await usersSchema.users.findOne({ username })

        //Ronak20240915
        return response.status(200).json({ message: 'Login successful', 
            // authentication_token: 'TestToken',
            // refresh_token: 'TestRefreshToken',
            // role: 'User'
        });

        if(!user)
        {
            return response.status(404).json({ message: 'Invalid Username' })
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if(passwordMatch)
        {

            const token = jwt.sign(
                { userId: user._id, username: user.username, role: user.role },
                jwt_secrect_code,
                { expiresIn: '4h' }
            );

            const refreshToken = jwt.sign(
                { userId: user._id, username: user.username, role: user.role },
                jwt_secrect_code,
                { expiresIn: '5d' }
            );

            return response.status(200).json({ message: 'Login successful', 
                authentication_token: token,
                refresh_token: refreshToken,
                role: user.role 
            });
        }
        else
        {
            response.status(400).json({ message: 'Invalid credentials' });
        }
    }
    catch(error)
    {
        response.status(500).json({ error: 'Internal Server Error' });
    }
    
});

router.get('/user/:id', verifyToken, async(request, response) => {
    try {
        const id = request.params.id;
        const user = await usersSchema.users.findOne({ _id: id });

        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        response.status(200).json({ data: user });
    } catch (error) {
        response.status(500).send(error);
    }
});

router.post('/refresh-token', (request, response) => {
    const { token } = request.body;
    
    if(!token)
    {
        return response.status(404).json({ message: 'Refresh token is required' });
    }

    jwt.verify(token, jwt_secrect_code, (error, user) => {
        if(error)
        {
            return response.status(404).json({ message: 'Invalid refresh token' });
        }

        const newToken = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            jwt_secrect_code,
            { expiresIn: '4h' }
        )
    })
});

router.post('/change-password/:id', verifyToken, async(request, response) => {
    const { currentPassword, newPassword } = request.body;

    if (!currentPassword || !newPassword) {
        return response.status(400).json({ message: 'Current and new passwords are required' });
    }

    try {
        const userId = request.user.userId;

        const user = await usersSchema.users.findById(userId);

        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            return response.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedNewPassword;
        await user.save();

        response.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        response.status(500).json({ message: 'Server error', error: error.message });
    }
});



router.post('/forgot-password', (request, response) => {
    const { email } = request.body;

    const body = `
    <html>
        <body>
        Hi,
        <br>
        <br>
        
        Following is the link to reset the password
        <br>

        <a href="www.google.com">Link</a>

        <br>
        <br>
        Thank you.
        </body>
    </html>    
    `

    mailer.sendEmail(email, 'Link to reset your password', body, () => {
        response.status(200).json({ message: "Mail sent successfully" });
    })
});

router.post('/upload-image/:id', verifyToken, upload.single('image'), async (request, response) => {
    try {
        console.log('File:', request.file);
        const userId = request.user.userId; 
        const imageFile = request.file;

        if (!imageFile) {
            return response.status(400).json({ message: 'No image uploaded' });
        }

        const user = await usersSchema.users.findById(userId);

        const base64Image = imageFile.buffer.toString('base64');

        user.image = base64Image;
        await user.save();

        response.status(200).json({ message: 'Image uploaded successfully' });
    } catch (error) {
        console.error('Error uploading image:', error);
        response.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;