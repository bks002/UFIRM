import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import { useSelector, useDispatch } from 'react-redux';

const ApprovalTable = ({
    title = 'Pending For Approval',
    gridHeader = [],
    gridData = [],
    onGridEdit,
    onGridDelete,
    onGridApprove,
    onGridView
}) => {
    const userrole= useSelector((state)=>state.Commonreducer.entrolval);
    const userid= useSelector((state)=>state.Commonreducer.userId);
    const username= useSelector((state)=>state.Commonreducer.userName);
    const useremail= useSelector((state)=>state.Commonreducer.userEmail);
    const companyid= useSelector((state)=>state.Commonreducer.companyid);
    const dispatch= useDispatch();
    const [openDropDown, setOpenDropDown] = useState(true);
    {console.log("Role",userrole)}
    {console.log("ID",userid)}
    {console.log("Name",username)}
    {console.log("Email",useremail)}
    {console.log("Company Id",companyid)}

    const handleToggle = () => {
        setOpenDropDown(prev => !prev);
    };

    const actionBodyTemplate = (rowData) => (
        <div className="flex gap-2">
            {onGridEdit && (
                <button className="btn btn-sm btn-info rounded mr-2" onClick={() => onGridEdit(rowData.Id)}>
                    <i class="fas fa-pen-alt"></i>
                </button>
            )}
            {onGridView && (
                <button className="btn btn-sm btn-warning rounded mr-2" onClick={() => onGridView(rowData.Id)}>
                    <i className="fa fa-eye" aria-hidden="true"></i>
                </button>
            )}
            {onGridDelete && (
                <button className="btn btn-sm btn-danger rounded mr-2" onClick={() => onGridDelete(rowData.Id)}>
                    <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
            )}
            {userrole=="Admin," && onGridApprove && (
                <button className="btn btn-sm btn-success rounded" onClick={() => onGridApprove(rowData.Id)}>
                    <i class='fa fa-check'></i>
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