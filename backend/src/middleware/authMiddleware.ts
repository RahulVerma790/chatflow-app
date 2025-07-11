import { config } from "../config"
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    user?: any
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({message: "Missing or invalid token"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        (req as any).user = decoded;
        next();
    } catch(err){
        console.log("JWT verification error: ",err);
        res.status(403).json({message: "Token verification failed "});
        return;
    }
}