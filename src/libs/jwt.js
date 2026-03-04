import jwt from 'jsonwebtoken'
import config from '../config.js'

export const createAccessToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRATION
        }, (err, token) => {
            if (err) reject(err)
            resolve(token)
        });
    });  
};