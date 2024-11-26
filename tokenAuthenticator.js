const jwt = require('jsonwebtoken');
const jwt_secrect_code = 'Coreco@123$';

function verifyAdminToken(request, response, next)
{
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token)
    {
        return response.status(404).json({ message: 'Access Denied: No Token Provided!' });
    }

    try
    {
        const decoded = jwt.verify(token, jwt_secrect_code);

        if(decoded.role != 'admin')
        {
            return response.status(404).json({ message: 'Access Denied: You do not have admin privileges!' });
        }

        request.user = decoded;
        next();
    }
    catch(error)
    {
        return response.status(404).json({ message: 'Invalid Token' });

    }
}

function verifyToken(request, response, next)
{
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token)
    {
        return response.status(404).json({ message: 'Access Denied: No Token Provided!' });
    }

    try
    {
        const decoded = jwt.verify(token, jwt_secrect_code);
        request.user = decoded;
        next();
    }
    catch(error)
    {
        return response.status(404).json({ message: 'Invalid Token' });

    }
}


module.exports = {
verifyAdminToken,
verifyToken,
};