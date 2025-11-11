import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { FilterMatchMode } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { fetchVisitor } from "../../Services/VisitorService"; // Make sure this is correctly imported
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import ExportToCSV from '../../ReactComponents/ExportToCSV/ExportToCSV.js';


const Visitor = () => {
    const [gridData, setGridData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    const [selectedVisitor, setSelectedVisitor] = useState(null);
    const [viewDialogVisible, setViewDialogVisible] = useState(false);

    const dt = useRef(null);
    const toast = useRef(null);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);

    useEffect(() => {
        if (propertyId) {
            setLoading(true);
            fetchVisitor(propertyId)
                .then((data) => {
                    setGridData(data);
                })
                .catch((err) => {
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Failed to load visitor data"
                    });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [propertyId]);

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setGlobalFilterValue(value);
        setFilters({
            ...filters,
            global: { value, matchMode: FilterMatchMode.CONTAINS }
        });
    };



    const viewVisitor = (visitor) => {
        setSelectedVisitor(visitor);
        setViewDialogVisible(true);
    };

    const actionTemplate = (rowData) => {
        return (
            <Button
             className="p-button-rounded p-button-info p-button-sm-rounded"
            onClick={() => viewVisitor(rowData)}
              tooltip="View Details"
              tooltipOptions={{ position: "top" }}
            >
             <i className="fa fa-eye" />
            </Button>

        );
    };

     const header = (
        <div className="d-flex justify-content-between align-items-center p-2">
                      <h5 className="m-0">Visitor</h5>
                      <div className="d-flex gap-2 align-items-center">
                        <span className="p-input-icon-left">
                         
                          <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Search..."
                          />
                        </span>
          
                          <ExportToCSV data={gridData} className="btn btn-success btn-sm rounded mr-2" />
                      </div>
        </div>
    );

    return (
        <div className="content-wrapper">
            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <Toast ref={toast} />
                        <div className="p-3">
                            <DataTable
                                ref={dt}
                                value={gridData}
                                loading={loading}
                                header={header}
                                paginator
                                rows={10}
                                filters={filters}
                                filterDisplay="row"
                                globalFilterFields={["ID", "Fname", "Lname", "Status", "MPurpose", "Address"]}
                                emptyMessage="No visitor found."
                                dataKey="ID"
                                breakpoint="960px"
                            >
                                <Column field="ID" header="ID" />
                                <Column
                                    header="Visitor Name"
                                    body={(rowData) => `${rowData.Fname} ${rowData.Lname}`}
                                />
                                <Column field="MPurpose" header="Purpose" />
                                <Column
                                    field="MeetingStartTime"
                                    header="In Time"
                                    body={(rowData) => new Date(rowData.MeetingStartTime).toLocaleString()}
                                />
                                <Column
                                    field="MeetingEndTime"
                                    header="Out Time"
                                    body={(rowData) =>
                                        rowData.MeetingEndTime
                                            ? new Date(rowData.MeetingEndTime).toLocaleString()
                                            : "-"
                                    }
                                />
                                <Column
                                    header="Status"
                                    body={(rowData) => {
                                        if (rowData.Status === "Approved") {
                                            return <span className="badge badge-success">Approved</span>;
                                        } else if (rowData.Status === "Rejected") {
                                            return <span className="badge badge-danger">Rejected</span>;
                                        } else {
                                            return <span className="badge badge-warning">{rowData.Status}</span>;
                                        }
                                    }}
                                />
                                <Column
                                    header="Action"
                                    body={actionTemplate}
                                    style={{ textAlign: "center", width: "100px" }}
                                />
                            </DataTable>

                            <Dialog
                                header="Visitor Details"
                                visible={viewDialogVisible}
                                style={{ width: "400px" }}
                                modal
                                onHide={() => setViewDialogVisible(false)}
                            >
                                {selectedVisitor && (
                                    <div>
                                        <p><strong>ID:</strong> {selectedVisitor.ID}</p>
                                        <p><strong>Name:</strong> {selectedVisitor.Fname} {selectedVisitor.Lname}</p>
                                        <p><strong>Purpose:</strong> {selectedVisitor.MPurpose}</p>
                                        <p><strong>In Time:</strong> {new Date(selectedVisitor.MeetingStartTime).toLocaleString()}</p>
                                        <p><strong>Out Time:</strong> {selectedVisitor.MeetingEndTime ? new Date(selectedVisitor.MeetingEndTime).toLocaleString() : "-"}</p>
                                        <p><strong>Status:</strong> {selectedVisitor.Status}</p>
                                    </div>
                                )}
                            </Dialog>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Visitor;
