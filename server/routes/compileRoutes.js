import express from 'express';
import { executeCode } from '../controllers/compileController.js';

const router = express.Router();

router.post('/run', executeCode);

export { router as compileRouter };
