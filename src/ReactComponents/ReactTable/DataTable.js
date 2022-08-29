import React, { useState } from 'react';
import { useTable, useSortBy, usePagination, useGlobalFilter, useAsyncDebounce } from 'react-table'
import DefaultPagination from './DefaultPagination'


// Define a default UI for filtering
function GlobalFilter({
    globalFilter,
    setGlobalFilter,
}) {
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200)
    return (
        <input
            className="form-control"
            value={value || ""}
            onChange={e => {
                setValue(e.target.value);
                onChange(e.target.value);
            }}
            placeholder="Search here..."
        />
    )
}

function DataTable(props) {
    const [customSearchVal, setCustomSearchVal] = useState('');
    const pageSizeOptions = [10, 20, 30, 50, 100];
    const data = React.useMemo(() => props.data, [props.data]);
    const columns = React.useMemo(() => props.columns, [props.columns])
    const myTable = useTable({ columns, data }, useGlobalFilter, useSortBy, usePagination,);
    const { getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        state: { pageSize, globalFilter },
        gotoPage,
        setPageSize,
        setGlobalFilter,
        rows
    } = myTable;
    const onPageChange = (pageNumber) => {
        gotoPage(pageNumber - 1)
    }
    return (
        <div>
            {
                props.hideGridSearchAndSize &&
                <div className="row justify-content-between">
                    <div className="col-2">
                        <label>Show</label>
                        <select
                            className="form-control"
                            value={pageSize}
                            onChange={e => {
                                setPageSize(Number(e.target.value))
                                !props.isDefaultPagination && props.onPageSizeChange(e.target.value)
                            }}
                        >
                            {pageSizeOptions.map(pageSize => (
                                <option key={pageSize} value={pageSize} >
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                    {
                        props.globalSearch && props.isDefaultPagination ?
                            <div className="col-3">
                                <label>Search</label>
                                <GlobalFilter
                                    globalFilter={globalFilter}
                                    setGlobalFilter={setGlobalFilter}
                                />
                            </div>
                            :
                            <div className="col-3">
                                <label>Search</label>
                                <input
                                    className="form-control"
                                    value={customSearchVal}
                                    onChange={e => {
                                        setCustomSearchVal(e.target.value);
                                        props.customSearch(e.target.value);
                                    }}
                                    placeholder="Search here..."
                                />
                            </div>
                    }
                </div>
            }

            <br></br>
            <div className="table-responsive">
                <table {...getTableProps} className="table table-striped table-bordered">
                    <thead style={{ background: '#80858e', color: '#fff' }}>
                        {// Loop over the header rows
                            headerGroups.map(headerGroup => (
                                // Apply the header row props
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {// Loop over the headers in each row
                                        headerGroup.headers.map(column => (
                                            // Apply the header cell props
                                            <th
                                                {...column.getHeaderProps(column.getSortByToggleProps({
                                                    style: { width: column.width },
                                                }))}
                                            >
                                                {// Render the header
                                                    column.render('Header')
                                                }
                                                <span>
                                                    {/* {column.isSorted ? (column.isSortedDesc ? ' ðŸ”½' : ' ðŸ”¼') : ''} */}
                                                    {column.isSorted ? (column.isSortedDesc ?
                                                        <i className="fa fa-arrow-down float-right" aria-hidden="true"></i>
                                                        : <i className="fa fa-arrow-up float-right" aria-hidden="true"></i>
                                                    ) : ''}
                                                </span>
                                            </th>
                                        ))}
                                </tr>
                            ))}
                    </thead>
                    {/* Apply the table body props */}
                    <tbody {...getTableBodyProps()}>
                        {// Loop over the table rows
                            page.map(row => {
                                // Prepare the row for display
                                prepareRow(row)
                                return (
                                    // Apply the row props
                                    <tr {...row.getRowProps()}>
                                        {// Loop over the rows cells
                                            row.cells.map(cell => {
                                                // Apply the cell props
                                                return (
                                                    <td {...cell.getCellProps()}>
                                                        {// Render the cell contents
                                                            cell.render('Cell')}
                                                    </td>
                                                )
                                            })}
                                    </tr>
                                )
                            })}
                    </tbody>
                </table>
            </div>

            <DefaultPagination
                totalRecord={props.isDefaultPagination ? rows.length : props.totalRecord}
                totalPage={props.isDefaultPagination ? (rows.length / pageSize) : props.totalPage}
                onPageChange={props.isDefaultPagination ? onPageChange : props.onPageChange}
            />
        </div>
    );
}
DataTable.defaultProps = {
    data: [],
    columns: [],
    globalSearch: true,
    isDefaultPagination: false, // if need to enable custom pagination then set false
    onPageSizeChange: () => { }, // if custom pagignation enabled need to pass 
    customSearch: () => { }, // if custom pagignation enabled need to pass 
    totalPage: 0, // if custom pagignation enabled need to pass 
    totalRecord: 0, // if custom pagignation enabled need to pass per page 
    onPageChange: () => { }, // if custom pagignation enabled need to pass 
    hideGridSearchAndSize: true // if false hide search and size on grid level default and custom search  
}
export default DataTable;