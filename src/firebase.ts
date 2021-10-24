import { initializeApp, cert } from 'firebase-admin/app';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';

credential:
const app = initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // replace `\` and `n` character pairs w/ single `\n` character
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
});


const verifyToken = async (token: string): Promise<DecodedIdToken> => {
    const auth = getAuth();
    const response = await auth.verifyIdToken(token);
    return response;
}

export {
    verifyToken
}
