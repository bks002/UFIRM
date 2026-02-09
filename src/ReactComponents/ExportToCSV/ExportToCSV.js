import React from "react";
import { CSVLink } from "react-csv";
import { Button } from "primereact/button";

const ExportToCSV = ({ data = [], fileName = "Tasklist.csv" }) => {
  return (
    <CSVLink
      data={data}
      filename={fileName}
      style={{ textDecoration: "none" }} // remove anchor styling
    >
      <Button
        label="Export"
        icon="pi pi-download"
        severity="info"
        size="small"
        tooltip="Download CSV"
        type="button"
      />
    </CSVLink>
  );
};

export default ExportToCSV;
