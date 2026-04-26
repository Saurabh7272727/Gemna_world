import StudentModelMain from '../model/Students.js';
import jwt from 'jsonwebtoken'
import { decryptData } from '../components/crypto.js';
import fs from 'fs/promises';
import StudentModel from '../model/student.form.schema.js';
import { env } from '../config/env.js';
import { logger } from '../observability/logger.js';

const extractBearerToken = (authorizationHeader) => {
    if (!authorizationHeader || typeof authorizationHeader !== 'string') {
        return null;
    }

    const [scheme, token] = authorizationHeader.trim().split(/\s+/);
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
        return null;
    }

    return token;
};

const cleanupUploadedFile = async (filePath) => {
    if (!filePath) {
        return;
    }

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            logger.error('Failed to clean up uploaded file during auth middleware', { message: error.message });
        }
    }
};

const UserAccessMiddleware = async (req, res, next) => {
    try {
        const firstCheckingLog = req.GASID || req.headers.authorization;
        if (!firstCheckingLog) {
            throw new Error("Authorization token are missing....");
        }

        const jwt_token = req.GASID || extractBearerToken(req.headers.authorization);

        if (!jwt_token) {
            return res.status(422).json({ message: "unauthorized access jwt_token", success: false, status: 422 });
        }

        const checkToken = jwt.verify(jwt_token, env.jwtSecret);
        if (!checkToken) {
            return res.status(422).json({ message: "Token are expired - 4 hours. for continue re-login", success: false, status: 422 });
        }

        const { id, password, provider, credentialHash } = checkToken;

        const findById = await StudentModelMain.findOne({ _id: id }).populate("ref_id");

        if (!findById) {
            return res.status(422).json({ message: "unauthorized access findById", success: false, status: 422 });
        }
        if (provider === 'google') {
            req.userDetails = findById;
            req.updatedAt = findById ? findById.updatedAt : null;
            return next();
        } else {
            const checkPassword = credentialHash
                ? credentialHash === findById.password
                : await findById.comparePassword(password);

            if (!checkPassword) {
                return res.status(422).json({ message: "unauthorized access checkPassword", success: false, status: 422 });
            }
            req.userDetails = findById;
            req.updatedAt = findById ? findById.updatedAt : null;
            return next();
        }


    } catch (error) {
        await cleanupUploadedFile(req?.file?.path);
        logger.warn('User access middleware denied request', {
            path: req.originalUrl,
            method: req.method,
            reason: error.message,
        });
        return res.status(500).json({ message: `server error Error-Code 422 ${error}`, success: false, status: 500 });
    }
}



const UserUploadSomethingLikeImage = async (req, res, next) => {
    try {
        let token = extractBearerToken(req.headers.authorization);
        if (!token) {
            throw new Error("Token not found in cookies");
        }

        if (token) {
            token = decryptData(token);
            if (['student', 'teacher'].includes(token?.role) && token?.jwt_token) {
                req.GASID = token.jwt_token;
            } else {
                throw new Error("Token role not valid");
            }
        } else {
            throw new Error("Token are not valid");
        }
    } catch (error) {
        res.status(501).json({
            message: `Something was wrong with you, please reload the page - ${error.message}`,
            success: false, status: 501
        });
        return;
    }

    try {
        const { time, image, image_format, image_size } = req.body;
        if (!time || !image_format) {
            res.status(501).json({
                message: `Provide full information about payload`,
                success: false, status: 501
            });
            return;
        }

        if ((image_size / 1024 / 1024).toFixed(2) >= 4.01) {
            res.status(400).json({
                message: `Payload data size is too long`,
                success: false, status: 400
            });
            return;
        }

        const typeArray = ['jpeg', 'png'];
        if (!typeArray.includes(image_format)) {
            res.status(400).json({
                message: `Image are required only in jpeg & png format`,
                success: false
                , status: 400
            });
            return;
        }

        if (typeArray.includes(image_format) && image && image_size) {
            next();
        } else {
            res.status(400).json({
                message: `Image data is required`,
                success: false
                , status: 400
            });
            return;
        }

    } catch (error) {
        res.status(501).json({
            message: `Internal server error ${error.message}`,
            success: false
            , status: 501
        });
        return;
    }
};


export { UserAccessMiddleware, UserUploadSomethingLikeImage };
