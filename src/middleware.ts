import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "./config";

interface CustomRequest extends Request {
  auth?: any;
}

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("verifyToken middleware reached...");
  const bearerHeader = req.headers["authorization"];
  console.log("bearerHeader", bearerHeader);
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1]; // Extract token from header
    jwt.verify(bearerToken, config.jwtSecret, (err, authData) => {
      console.log("authData", authData);
      if (err) {
        res.sendStatus(403);
      } else {
        req.auth = authData; // Attach authData to request object
        next(); // Proceed to next middleware or route handler
      }
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};
