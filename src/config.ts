const dbPort = process.env.NODE_ENV === 'development' ? 27017 : 21018;

export default {
  mongodbConfig: {
    url: `mongodb://localhost:${dbPort}/blog`,
    options: { useNewUrlParser: true },
  },
  serverPort: 9000,
};