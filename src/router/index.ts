"use strict";

import express from "express";

module.exports = (app: express.Express) => {
  app.use("/user/signup", require("./routes/user/signup"));
  app.use("/user/login", require("./routes/user/login"));
  // app.use("/user/auth/google", require("./routes/user/auth-google"));
  // app.use("/user/authenticate", require("./routes/user/authenticate")); // Need to try the verifyToken middleware idea. Consider deleting this route.
  // app.use("/user/auth-session", require("./routes/user/auth-session"));
  app.use("/user/forgot-password", require("./routes/user/forgot-password"));
  // app.use("/user/reset-password", require("./routes/user/reset-password"));
  // app.use("/user/email-available", require("./routes/user/email-available"));
  // app.use(
  //   "/user/username-available",
  //   require("./routes/user/username-available")
  // );
  app.use("/user/users", require("./routes/user/users"));
  // app.use("/user/delete-all", require("./routes/user/delete-all"));
  app.use("/journal/create", require("./routes/journal/create"));
  // app.use("/journal/edit", require("./routes/journal/edit"));
  // app.use("/journal/journals", require("./routes/journal/journals"));
  // app.use("/journal/delete", require("./routes/journal/delete"));
  app.use("/journal/new-category", require("./routes/journal/new-category"));
  // app.use(
  //   "/journal/bulk-set-category",
  //   require("./routes/journal/bulk-set-category")
  // );

  // These routes are not implemented yet
  // app.use(
  //   "/journal/deleteSelectedJournals",
  //   require("./routes/journal/deleteSelectedJournals")
  // );
  // app.use(
  //   "/journal/deleteSelectedCategories",
  //   require("./routes/journal/deleteSelectedCategories")
  // );
  // app.use(
  //   "/journal/updateJournalCategories",
  //   require("./routes/journal/updateJournalCategories")
  // );
  // app.use("/journal/addCategory", require("./routes/journal/addCategory"));
};
