require('dotenv').config();
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Function to authenticate user, for access to admin panel or restricted routes
 * The function checks the JWT which was given to the user when logging in
 * @param {Token} string The JWT
*/
export function authenticate(req: Request, res: Response, next: NextFunction) {
	// Check if token exists
	let token: string;
	try {
		token = req.body.token;
		if (token == null || token == '') {
			res.status(401).json({error: 'Not authenticated.'});
			return;
		}
	} catch (err) {
		res.status(401).json({error: 'Not authenticated.'});
		return;
	}

	// Verifying the token
    jwt.verify(token, process.env.SECRET, (err: any) => {
		if (err) {
			res.status(401).json({error: 'Not authenticated.'});
			return;
		} else {
			next();
			return;
		}
    });
}
