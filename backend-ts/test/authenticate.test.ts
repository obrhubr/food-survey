import { NextFunction, Request, Response } from 'express';
import { authenticate } from '../lib/authenticate';
import jwt from 'jsonwebtoken';

describe('Test authentication middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: (t) => { return mockResponse as Response},
            json: jest.fn()
        };
    });

    test('If JWT-token is not set', async () => {
        const expectedResponse = {error: 'Not authenticated.'};

        authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.json).toBeCalledWith(expectedResponse);
    });

    test('If token is set', async () => {
        mockRequest = {
            body: {
                token: jwt.sign({authorized: true}, process.env.SECRET, {
                    expiresIn: '12h',
                })
            },
		}

        authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toBeCalledTimes(1);
    });
});