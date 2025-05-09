import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authorizationHeader.split(" ")[1];
    next();
    // try {
    //     const decodedToken = await admin.auth().verifyIdToken(token);
    //     (req as any).user = decodedToken;
    //     next();
    // } catch (error) {
    //     res.status(403).json({ message: "Invalid token" });
    // }
};
