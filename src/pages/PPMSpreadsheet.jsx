import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const PPMSpreadsheet = () =>  {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/docs/PPM_Schedule_2025(1).xlsx');
                const arrayBuffer = await response.arrayBuffer();

                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0]; // Getting the first sheet
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                setData(jsonData);
            } catch (error) {
                console.error('Error reading Excel file:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="content-wrapper">
        <div className="card content">
            <h1>PPM Calendar</h1>
            {data.length > 0 ? (
                <table className="table table-bordered table-striped">
                    <thead className="table-light">
                    <tr>
                        {Object.keys(data[0]).map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {Object.values(row).map((cell, cellIndex) => (
                                <td key={cellIndex}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>Loading...</p>
            )}
        </div>
        </div>    );
};

export default PPMSpreadsheet;