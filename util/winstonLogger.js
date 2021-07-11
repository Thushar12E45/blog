const { createLogger, transports, format } = require('winston');

const logger = createLogger({
  transports: [
    new transports.File({
      name: 'error-file',
      filename: './filelog/error.log',
      level: 'error',
      json: true,
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.json()
      ),
    }),
  ],
});

module.exports = logger;
