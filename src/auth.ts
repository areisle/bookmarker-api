import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import { prisma } from './db';
import { AuthenticationError } from 'apollo-server-errors';

/**
 *
 * @param token to verify
 * @returns string username
 */
function authenticateToken(token: string) {
    try {
        return jwt.verify(token, process.env.TOKEN_SECRET!) as { email: string };
    } catch (e) {
        throw new AuthenticationError('Unable to validate token.')
    }
}

async function createUser(email: string, password: string) {
    const salt = await bcrypt.genSalt(10);
    const saltedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
        data: {
            email,
            password: saltedPassword
        }
    });
    return user;
}

/**
 *
 * @param email
 * @param password
 * @returns string the token
 */
async function login(email: string, password: string): Promise<string> {
    const user = await prisma.user.findUnique({
        where: {
            email,
        }
    });

    if (!user) {
        throw new AuthenticationError('Unable to find user with matching email.')
    }

    if (!user.password) {
        throw new AuthenticationError('User is not activated.');
    }

    // validate password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        throw new AuthenticationError('Invalid password.')
    }

    return jwt.sign({email}, process.env.TOKEN_SECRET!, { expiresIn: '7d' });
}

export {
    login,
    createUser,
    authenticateToken,
}
