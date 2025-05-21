import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

const ApprovalTable = ({
    title = 'Pending For Approval',
    gridHeader = [],
    gridData = [],
    onGridEdit,
    onGridDelete,
    onGridApprove,
    onGridView
}) => {
    const [openDropDown, setOpenDropDown] = useState(true);

    const handleToggle = () => {
        setOpenDropDown(prev => !prev);
    };

    const actionBodyTemplate = (rowData) => (
        <div className="flex gap-10">
            {onGridView && (
                <button icon={<i className="fa fa-eye" aria-hidden="true"></i>} className="btn btn-sm btn-info rounded" onClick={() => onGridView(rowData.Id)}>
                    View
                </button>
            )}
            {onGridEdit && (
                <button className="btn btn-sm btn-warning rounded" onClick={() => onGridEdit(rowData.Id)}>
                    Edit
                </button>
            )}
            {onGridDelete && (
                <button icon={<i className="fa fa-trash" aria-hidden="true"></i>} className="btn btn-sm btn-danger rounded" onClick={() => onGridDelete(rowData.Id)}>
                    Delete
                </button>
            )}
            {onGridApprove && (
                <button className="btn btn-sm btn-success rounded" onClick={() => onGridApprove(rowData.Id)}>
                    Approve
                </button>
            )}
        </div>
    );

    return (
        <div className="card">
            <div
                className="card-header d-flex p-0"
                onClick={handleToggle}
                style={{ cursor: 'pointer', backgroundColor: '#f1e7c3' }} 
            >
                <h5 className="ml-3 mt-2">{title}</h5>
                <ul className="nav ml-auto tableFilterContainer">
                    <li className="nav-item">
                        <div className="input-group input-group-sm">
                            <div className="input-group-prepend">
                                <span
                                    className="btn btn-primary"
                                    style={{ backgroundColor: '#f1e7c3', color: '#000000' }}
                                >
                                    {openDropDown ? '\u2191' : '\u2193'}
                                </span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            {openDropDown && gridData.length > 0 && (
                <div className="card-body">
                    <DataTable
                        value={gridData}
                        paginator={false}
                        rows={2}  
                        scrollable
                        className="p-datatable-striped"
                    >
                        {gridHeader
                            .filter(
                                (col) =>
                                    col.titleValue.toLowerCase() !== 'action' &&
                                    col.titleValue.toLowerCase() !== 'actions'
                            )
                            .map((col, idx) => (
                                <Column key={idx} field={col.sTitle} header={col.titleValue} />
                            ))}

                        {/* Render action buttons if any callbacks provided */}
                        {(onGridEdit || onGridDelete || onGridApprove || onGridView) && (
                            <Column header="Actions" body={actionBodyTemplate} style={{ minWidth: '200px' }} />
                        )}
                    </DataTable>
                </div>
            )}
        </div>
    );
};

export default ApprovalTable;