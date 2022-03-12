/**
 * Function to get today's date in ISO format (ensure compatibility with statistical tool, backend and DB)
 * Generates a date (ex: '2022-1-01')
*/
export function iso(): string {
    const ts = Date.now();
    const date_ob = new Date(ts);
    const date = date_ob.getDate();
    const month = date_ob.getMonth() + 1;
    const year = date_ob.getFullYear();
    const iso_date = year + '-' + (month < 10 ? '0' + month : month) + '-' + date;
    return iso_date;
}
