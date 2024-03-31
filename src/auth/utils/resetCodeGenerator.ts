import { randomBytes } from 'crypto';

export const generateResetCode = () => randomBytes(3).toString('hex').toUpperCase();
