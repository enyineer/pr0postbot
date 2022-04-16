import winston from "winston"

export class Logger {

    private static instance: winston.Logger;

    static get i(): winston.Logger {
        if (Logger.instance === undefined) {
            Logger.instance = winston.createLogger({
                level: 'info',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
                transports: [
                    new winston.transports.Console()
                ],
            });
        }
        return Logger.instance;
    }

    private constructor() {
        // Do nothing
    }


}