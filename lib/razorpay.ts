import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if ((!keyId || !keySecret) && !isBuildPhase) {
  throw new Error(
    "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
  );
}

const razorpay = new Razorpay({ 
  key_id: keyId || "placeholder_id", 
  key_secret: keySecret || "placeholder_secret" 
});

export default razorpay;

