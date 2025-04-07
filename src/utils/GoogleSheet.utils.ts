import { config } from './dotenv.utils';
config();

interface SheetData {
    range: string;
    majorDimension: string;
    values: string[][];
}

export class Sheet {
    async getData(sheetId: string, range: string) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${process.env['GOOGLE_AUTH_KEY']}`;
        
        const response = await fetch(url);
        
        if (!response.ok) { throw new Error('Failed to fetch data'); }

        return await response.json() as SheetData;
    }
}