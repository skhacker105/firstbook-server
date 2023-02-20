const EXCEL = require('exceljs');

module.exports = {
    createExcelFile: (rows, cols) => {
        const workbook = new EXCEL.Workbook();
        const worksheet = workbook.addWorksheet('ExampleSheet');
        // add column headers
        worksheet.columns = cols; //[
        //     { header: 'Package', key: 'package_name' },
        //     { header: 'Author', key: 'author_name' }
        // ];

        rows.forEach(row => {
            worksheet.addRow(mapDataToColumns(row, cols));
        });
        // Add row using key mapping to columns
        // worksheet.addRow(
        //     { package_name: "ABC", author_name: "Author 1" },
        //     { package_name: "XYZ", author_name: "Author 2" }
        // );

        // // Add rows as Array values
        // worksheet.addRow(["BCD", "Author Name 3"]);

        // Add rows using both the above of rows
        // const rows = [
        //     ["FGH", "Author Name 4"],
        //     { package_name: "PQR", author_name: "Author 5" }
        // ];
        // worksheet.addRows(rows);

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
        if (data[col.key]) result.push(data[col.key]);
    });
    return result;
}