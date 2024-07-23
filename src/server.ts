"use strict";

import config from "./config";
import express, { NextFunction, Request, Response } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import helmet from "helmet";
import mongoose, { Collection } from "mongoose";
import passport from "passport";
import cors from "cors";
import debug from "debug";
import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
const { MongoClient, ServerApiVersion } = require("mongodb");
// const cluster = require("cluster");
// const path = require("path");
// const GoogleStrategy = passportGoogleOAuth20.Strategy;
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../swagger-spec.json");

// export default app;

export async function server() {
  try {
    // if (cluster.isMaster) {
    //   const cpus = require("os").cpus().length;

    //   for (let i = 0; i < cpus; i++) {
    //     cluster.fork();
    //   }
    // } else {
    // let mongooseConnection!: Promise<typeof mongoose>;
    const name = "NodeJS-Express";
    const app = express();

    // const swaggerUiAssetPath = require("swagger-ui-dist").getAbsoluteFSPath();
    // console.log(swaggerUiAssetPath);
    debug(name);

    // ANNOUNCMENT! App Is in ** env of development!
    // Online/Offline status
    // ------------------------------------------------
    console.log(
      `App is in: ${config.env.toUpperCase()}. Online: ${config.online}.`
    );

    // Database
    // ------------------------------------------------

    if (config.online) {
      // await client.connect();
      // mongooseConnection = mongoose.connect(dbURI);
      // mongoose.connection.on("connected", () => {
      //   console.log("Mongoose connection CONNECTED");
      // });
      // mongoose.connection.on("error", (err) => {
      //   console.log("Mongoose connection ERROR. Error: " + err);
      //   mongoose.disconnect();
      //   // Reconnect?
      // });
      // mongoose.connection.on("disconnected", () => {
      //   console.log("Mongoose connection DISCONNECTED");
      //   mongoose.connect(dbURI);
      // });
      // const adapter = new MongodbAdapter(
      //   mongoose.connection.collection("sessions"),
      //   mongoose.connection.collection("users")
      // );
    }

    // Express Variables
    // ----------------------------------------------------
    app.set("port", config.port);

    // Middleware
    // ----------------------------------------------------

    app.use(logger("dev"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(helmet());
    app.disable("x-powered-by");
    app.use(cors());
    app.use(passport.initialize());
    app.use(express.json());

    // Router
    // ----------------------------------------------------
    app.use("*", (req: Request, res: Response, next: NextFunction) => {
      console.log(req.cookies);
      next();
    });
    require("./router")(app);
    app.use("/api-docs", swaggerUi.serve);
    app.get("/api-docs", swaggerUi.setup(swaggerSpec));
    // app.get("*", async (req: express.Request, res: express.Response<string>) => {
    //   res.sendFile(path.join(__dirname, "../dist/index.html"));
    // });

    // 404 & Error handling
    // ----------------------------------------------------
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      res.status(404).send("Sorry can't find that!");
    });

    // error handlers

    // development error handler
    // will print stacktrace
    // if (app.get('env') === 'development') {
    //  app.use(function(err, req, res, next) {
    //    res.status(err.status || 500);
    //    res.render('error', {
    //      message: err.message,
    //      error: err
    //    });
    //  });
    // }

    // production error handler
    // no stacktraces leaked to user
    // app.use(function(err, req, res, next) {
    //  res.status(err.status || 500);
    //  res.render('error', {
    //    message: err.message,
    //    error: {}
    //  });
    // });

    // If node process ends, close mongoose connection
    // ----------------------------------------------------
    process.on("SIGINT", async () => {
      if (config.online) {
        // await client.close();
        // mongoose.connection.close();
        console.log("Closing Mongoose connection because node process ended.");
        process.exit(0);
      }
    });

    // Server Port
    // ----------------------------------------------------
    app.listen(config.port, () => {
      console.log(
        "Listening on port " +
          app.get("port") +
          ". Worker ID: " +
          // cluster.worker.id +
          "."
      );
    });
  } catch (error: any) {
    console.log(error.stack);
  } finally {
    // await client.close();
  }
}

server().catch(console.dir);

export default server;
