import { db } from "./db";

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
}

class Logger {
  private static instance: Logger;
  private isProduction = process.env.NODE_ENV === 'production';

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async saveToDb(entry: LogEntry) {
    try {
      // ActivityLog table mapping
      await db.activityLog.create({
        data: {
          action: `${entry.level.toUpperCase()}: ${entry.message}`,
          details: entry.context ? JSON.stringify(entry.context) : null,
          // Since we might not have a session in all contexts, these are optional
          userEmail: entry.context?.userEmail || "System",
          ipAddress: entry.context?.ip || null,
        }
      });
    } catch (e) {
      console.error("Failed to save log to DB:", e);
    }
  }

  private log(entry: LogEntry) {
    const formattedMessage = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
    
    // Fire and forget DB saving
    this.saveToDb(entry);
    
    if (this.isProduction) {
      // In production, we could send this to an external service like Sentry, Logtail, etc.
      // For now, we'll keep it to console but with structured format
      if (entry.level === 'error') {
        console.error(formattedMessage, entry.context || '');
      } else if (entry.level === 'warn') {
        console.warn(formattedMessage, entry.context || '');
      } else {
        console.log(formattedMessage, entry.context || '');
      }
    } else {
      // Development logging
      const styles = {
        info: '\x1b[32m', // Green
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
        debug: '\x1b[34m', // Blue
        reset: '\x1b[0m'
      };

      console.log(`${styles[entry.level]}${formattedMessage}${styles.reset}`, entry.context || '');
    }
  }

  public info(message: string, context?: any) {
    this.log({ level: 'info', message, timestamp: new Date().toISOString(), context });
  }

  public warn(message: string, context?: any) {
    this.log({ level: 'warn', message, timestamp: new Date().toISOString(), context });
  }

  public error(message: string, context?: any) {
    this.log({ level: 'error', message, timestamp: new Date().toISOString(), context });
  }

  public debug(message: string, context?: any) {
    if (!this.isProduction) {
      this.log({ level: 'debug', message, timestamp: new Date().toISOString(), context });
    }
  }
}

export const logger = Logger.getInstance();
