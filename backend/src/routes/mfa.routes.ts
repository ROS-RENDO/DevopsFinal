import { Router } from 'express';
import { requestMfaCode, verifyMfaCode, enableMfa, disableMfa, getMfaStatus } from '../controllers/mfa.controller.js';
import { validate } from '../middleware/validate.js';
import { requestMfaSchema, verifyMfaSchema } from '../schemas/mfa.schema.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public — used during the login flow
router.post('/request', validate(requestMfaSchema), requestMfaCode);
router.post('/verify', validate(verifyMfaSchema), verifyMfaCode);

// Protected — requires a valid access token
router.get('/status', authenticate, getMfaStatus);
router.post('/enable', authenticate, enableMfa);
router.post('/disable', authenticate, disableMfa);

export default router;
