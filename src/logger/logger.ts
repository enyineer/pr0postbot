import winston from "winston"

export class Logger {

    private static instance: winston.Logger;

    static get i(): winston.Logger {
        if (Logger.instance === undefined) {
            Logger.instance = winston.createLogger({
                level: 'info',
                format: winston.format.json(),
                transports: [
                    new winston.transports.Console({
                        format: winston.format.simple()
                    })
                ],
            });
        }
        return Logger.instance;
    }

    private constructor() {
        // Do nothing
    }


}