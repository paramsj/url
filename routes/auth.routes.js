import { Router } from "express";
import {registerUser , loginUser ,getCurrentUser , refreshAccessToken , logoutUser} from '../controllers/auth.controllers.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post('/register',registerUser);
router.post("/login", loginUser);
router.get('/me',verifyJWT,getCurrentUser);
router.post('/refresh',verifyJWT,refreshAccessToken);
router.post('/logout',logoutUser);
export default router;