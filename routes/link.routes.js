import { Router } from "express";
import {createShortLink , getAllLinks , redirectToOriginalUrl , getLinkStats} from '../controllers/link.controllers.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post('/',verifyJWT, createShortLink);
router.get('/',verifyJWT,getAllLinks);
router.get('/:shortCode',redirectToOriginalUrl);
router.get('/:id/stats',verifyJWT,getLinkStats);
export default router;