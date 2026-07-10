import { Router } from 'express';
import { requestMfaCode, verifyMfaCode } from '../controllers/mfa.controller.js';
import { validate } from '../middleware/validate.js';
import { requestMfaSchema, verifyMfaSchema } from '../schemas/mfa.schema.js';

const router = Router();

router.post('/request', validate(requestMfaSchema), requestMfaCode);
router.post('/verify', validate(verifyMfaSchema), verifyMfaCode);

export default router;
