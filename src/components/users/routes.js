import express from "express";
import userControllers from "./controllers";

const userRoutes = express.Router();

//======================== GET ========================
// userRoutes.get('/other/:id', authMiddleware, userControllers.getOneById);
// userRoutes.get(
//   '/student/:studentId',
//   authMiddleware,
//   userControllers.getOneByStudentId
// );
//======================== POST ========================
userRoutes.post("/register", userControllers.register);
// userRoutes.post('/register/google', userControllers.registerGoogle);
// userRoutes.post('/login', userControllers.login);
// userRoutes.post('/login/google', userControllers.loginGoogle);
// //======================== PUT ========================
// userRoutes.put('/me', authMiddleware, userControllers.putOne);
//======================== DELETE ========================

export default userRoutes;
