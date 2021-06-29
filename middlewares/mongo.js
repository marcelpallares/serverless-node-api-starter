const mongoose = require("mongoose");

export const mongo = (config) => {
  if (config === undefined) {
    config = {
      shouldClose: false,
    };
  }

  return {
    before: async () => {
      if (mongoose.connection.readyState === 1) {
        console.info("=> Using existing database connection");
      } else {
        console.info("=> Using new database connection");

        await mongoose.connect(process.env.MONGO_URL, {
          useCreateIndex: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
        });
      }
      return;
    },
    after: async () => {
      if (config.shouldClose && mongoose.connection.readyState !== 0) {
        console.info("=> Closing database connection");
        await mongoose.connection.close();
      }
      return;
    },
  };
};
