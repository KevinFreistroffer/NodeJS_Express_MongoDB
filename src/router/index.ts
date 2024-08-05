"use strict";

import express from "express";

module.exports = (app: express.Express) => {
  app.use("/auth/bearer", require("./routes/auth/bearer"));
  app.use("/user/signup", require("./routes/user/signup"));
  app.use("/user/login", require("./routes/user/login"));
  app.use("/user/forgot-password", require("./routes/user/forgot-password"));
  app.use("/user/reset-password", require("./routes/user/reset-password"));
  app.use("/user/email-available", require("./routes/user/email-available"));
  app.use(
    "/user/username-available",
    require("./routes/user/username-available")
  );
  app.use("/user/users", require("./routes/user/users"));
  app.use("/user/delete-all", require("./routes/user/delete-all"));
  app.use("/journal/create", require("./routes/user/journal/create"));
  app.use("/journal/edit", require("./routes/user/journal/edit"));
  app.use("/journal/journals", require("./routes/user/journal/journals"));
  app.use("/journal/delete", require("./routes/user/journal/delete"));
  app.use(
    "/user/journal/category/create",
    require("./routes/user/journal/category/create")
  );

  app.use(
    "/user/journal/bulk-set-category",
    require("./routes/user/journal/bulk-set-category")
  );

  //These routes are not implemented yet
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
};
