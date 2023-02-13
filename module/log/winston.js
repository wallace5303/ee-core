const { createLogger, format, transports } = require("winston");

class Log  {
  constructor() {
    this.type = undefined;
    this.logger = undefined;
  }

  create() {
    const customFormat = format.combine(
      format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
      format.align(),
      format.printf((i) => `${i.level}: ${[i.timestamp]}: ${i.message}`)
    );
    let transportsOpt = [
      new transports.File({
          filename: "logs/server.log",
          level: "info",
          format: format.combine(
              format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
              format.align(),
              format.printf(
                  (info) =>
                      `${info.level}: ${[info.timestamp]}: ${info.message}`
              )
          ),
      }),
    ];

    let createOpt = {
      level: 'info',
      format: customFormat,
      transports: transportsOpt
    }

    this.logger = createLogger(createOpt);
  }

}  

module.exports = Log;