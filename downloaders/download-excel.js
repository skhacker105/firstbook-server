const EXCEL = require('exceljs');

module.exports = {
    createExcelFile: (rows, cols, sheetName = 'Private Sheet') => {
        const workbook = new EXCEL.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);
        worksheet.columns = cols;
        rows.forEach(row => {
            worksheet.addRow(mapDataToColumns(row, cols));
        });

        workbook.creator = 'FirstBook';
        workbook.lastModifiedBy = 'Bot';
        workbook.created = new Date();
        workbook.modified = new Date();
        workbook.lastPrinted = new Date();

        return workbook.xlsx;
    }
}


function mapDataToColumns(data, cols) {
    if (!cols || !data) return [];
    let result = [];
    cols.forEach(col => {
        if (col.key && data[col.key]) result.push(data[col.key]);
        else if (col.findFunction && col.findFunction(data)) result.push(col.findFunction(data));
        else if (col.altkey && data[col.altkey]) result.push(data[col.altkey]);
        else result.push('');
    });
    return result;
}