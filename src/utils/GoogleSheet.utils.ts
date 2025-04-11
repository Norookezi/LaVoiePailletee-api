import { config } from './dotenv.utils';
config();

interface SheetData {
    range: string;
    majorDimension: string;
    values: string[][];
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export class Sheet {
    async getData(sheetId: string, range: string) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${process.env['GOOGLE_AUTH_KEY']}`;
        
        const response = await fetch(url).catch(async (error) => {
            console.log(error);
            await delay(36000000);
            throw error;
        });
        
        if (!response.ok) { throw new Error('Failed to fetch data'); }

        return await response.json() as SheetData;
    }
}