require('dotenv').config();
import winston from 'winston';

// Create winston logger
export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		winston.format.printf(
			info =>
			`${info.timestamp} ${info.level}: ${info.message}` +
			(info.splat !== undefined ? `${info.splat}` : ' ')
		)
    ),
    defaultMeta: {service: 'backend'},
    transports: [
		// Save specific log levels to different files
		new winston.transports.File({filename: './logs/error.log', level: 'error'}),
		new winston.transports.File({filename: './logs/info.log', level: 'info'}),
		new winston.transports.File({filename: './logs/all.log', level: 'silly'}),
		// Write all logs to /var/log to access them from Cloud Logging
		new winston.transports.File({
			filename: '/var/log/backend.log',
			level: 'silly',
		}),
    ],
});
