import crypto from 'crypto';

function generateTrackingToken() {
  return crypto.randomBytes(32).toString('hex');
}

export default generateTrackingToken;
