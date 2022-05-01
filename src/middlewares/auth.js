import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.headers?.authorization?.split(' ')[1];
  try {
    const decodedObject = jwt.decode(token, process.env.JWT_SECRET);
    const decodedData = decodedObject.data;
    req.user = decodedData;
    next();
  } catch (error) {
    res.status(401).send({
      message: 'Access denied!',
    });
  }
};

export default authMiddleware;
