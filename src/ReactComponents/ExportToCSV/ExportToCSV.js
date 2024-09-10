import React from 'react';
import { CSVLink } from 'react-csv';

const ExportToCSV = ({ data = [] ,className }) => {
  console.log(className);
  return (
    <CSVLink
      data={data}
      filename="Tasklist.csv"
      onClick={() => console.log('Export button clicked', data)}
      className={className}
      // style={{
      //   color: 'white',
      //   textDecoration: 'none',
      //   backgroundColor: '#007bff',
      //   padding: '10px',
      //   borderRadius: '5px',
      // }}
    >
     Download Report <i className="fa fa-arrow-down" aria-hidden="true"></i>
    </CSVLink>
  );
};

export default ExportToCSV;