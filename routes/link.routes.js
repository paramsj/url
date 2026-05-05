import { Router } from "express";
import {createShortLink , getAllLinks} from '../controllers/link.controllers.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post('/createLink',verifyJWT, createShortLink);
router.get('/getAllLinks',verifyJWT,getAllLinks);
export default router;