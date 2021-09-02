module.exports = {
  apps: [{
    name: "app",
    script: "./dist/app.js",
    out_file: "./logs/chat/chat_out.log",
    error_file: "./logs/chat/chat_error.log",
    env_production: {
      NODE_ENV: "production"
    },
    env_development: {
      NODE_ENV: "development"
    }
  }]
};
