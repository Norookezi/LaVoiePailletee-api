import { writeFileSync } from 'fs';
import { config } from './dotenv.utils';
config();
/**
 * This is a logger 
 */
export class Logger {
    private static __instance: Logger | null = null;
    private static instanceInitDate: string | null = null;

    public static style = {
        Reset: '\x1b[0m',
        Bold: '\x1b[1m',
        Italic: '\x1b[3m',
        Underline: '\x1b[4m',
        Reverse: '\x1b[7m',
        Hidden: '\x1b[8m',
        Strike: '\x1b[9m',
    };
    
    public static textColor = {
        BrightBlack: '\x1b[90m',
        BrightRed: '\x1b[91m',
        BrightGreen: '\x1b[92m',
        BrightYellow: '\x1b[93m',
        BrightBlue: '\x1b[94m',
        BrightMagenta: '\x1b[95m',
        BrightCyan: '\x1b[96m',
        BrightWhite: '\x1b[97m',
        Black: '\x1b[30m',
        Red: '\x1b[31m',
        Green: '\x1b[32m',
        Yellow: '\x1b[33m',
        Blue: '\x1b[34m',
        Magenta: '\x1b[35m',
        Cyan: '\x1b[36m',
        White: '\x1b[37m'
    };
    
    public static backgroundColor = {
        LightBlack: '\x1b[100m',
        LightRed: '\x1b[101m',
        LightGreen: '\x1b[102m',
        LightYellow: '\x1b[103m',
        LightBlue: '\x1b[104m',
        LightMagenta: '\x1b[105m',
        LightCyan: '\x1b[106m',
        LightWhite: '\x1b[107m',
        Black: '\x1b[40m',
        Red: '\x1b[41m',
        Green: '\x1b[42m',
        Yellow: '\x1b[43m',
        Blue: '\x1b[44m',
        Magenta: '\x1b[45m',
        Cyan: '\x1b[46m',
        White: '\x1b[47m',
    };
    
    public static set instance(instance: Logger) {
        if (Logger.__instance) return;
        const now: Date = new Date();

        
        Logger.__instance = instance;
        Logger.instanceInitDate = Logger.__instance.parseDate(now);
    }

    public static get instance(): Logger {
        if (!Logger.__instance) this.instance = new Logger();

        return Logger.__instance!;
    }

    public parseDate(date: Date): string {
        return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth()+1)).slice(-2)}/${date.getFullYear()}: ${('0' + (date.getHours())).slice(-2)}:${('0' + (date.getMinutes())).slice(-2)}:${('0' + (date.getSeconds())).slice(-2)}.${(date.getMilliseconds() +'0').slice(0,3)}`;
    }

    public static log(args: string | string[], print: boolean = true, write: boolean = true, type: 'log'|'error'|'info'|'hint'|'success' = 'log') {        
        const logger: Logger = Logger.instance;

        const date: string = logger.now(logger);
        const contentAsString: string = (typeof args === 'string'?args: args.join(', '));
        
        const color = {
            'log': Logger.textColor.BrightWhite,
            'error': Logger.textColor.Red,
            'info': Logger.textColor.BrightYellow,
            'hint': Logger.textColor.White,
            'success': Logger.textColor.Green
        };

        if (print) console.log(date, color[type], contentAsString, Logger.style.Reset);

        if (write) Logger.instance.writeFile(contentAsString, date);
    }

    public static error(args: string | string[], print: boolean = true, write: boolean = true) { Logger.log(args, print, write, 'error'); }
    public static info(args: string | string[], print: boolean = true, write: boolean = true) { Logger.log(args, print, write, 'info'); }
    public static hint(args: string | string[], print: boolean = true, write: boolean = true) { Logger.log(args, print, write, 'hint'); }

    public static waiting(args: string | string[], print: boolean = true, write: boolean = true) { Logger.log('⌛ ' + args, print, write, 'info'); }
    public static success(args: string | string[], print: boolean = true, write: boolean = true) { Logger.log('✅ ' + args, print, write, 'success'); }
    public static failed(args: string | string[], print: boolean = true, write: boolean = true) { Logger.log('❌ ' + args, print, write, 'error'); }

    private now(logger: Logger): string {
        const now: Date = new Date(); 
        const date: string = logger.parseDate(now);
        
        return date;
    }

    private writeFile(line: string, date: string) {
        const logLine: string = line.split('\n').map((text, index) => {
            if (index == 0) return date.split(' ')[1] + ': ' + text;

            return ' '.repeat((date.split(' ')[1] + ': ').length) + text;
        }).join('\n');

        writeFileSync(`${Logger.instanceInitDate!.split(':')[0].replace(/\//g, '-')}_${Logger.instanceInitDate!.split(' ')[1].replace(/:/g, '').replace(/\./, '_')}.logs`, logLine + '\n', { encoding: 'utf8', flag: 'a'});
    }

}