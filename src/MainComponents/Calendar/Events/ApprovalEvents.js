import React, { Component, Fragment } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import PropagateLoader from "react-spinners/PropagateLoader";
import * as appCommon from '../../../Common/AppCommon.js';
import DataTable from '../../../ReactComponents/ReactTable/DataTable';
import ApiProvider from '../DataProvider';
import EventApprovalModal from './EventApprovalModal';

import { connect } from 'react-redux';
import departmentAction from '../../../redux/department/action';
import { bindActionCreators } from 'redux';
import ApproverDetails from './ApproverDetails.js';


class ApprovalEvents extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [
                {
                    Header: 'Id',
                    accessor: 'eventApprovalId', // accessor is the "key" in the data
                    width: "5%",
                },
                {
                    Header: 'Event ID/Title',
                    accessor: 'title', // accessor is the "key" in the data     
                    width: "18%",
                },
                {
                    Header: 'Event Date',
                    accessor: 'eventOn', // accessor is the "key" in the data   
                    width: "10%",
                },
                {
                    Header: 'Requester',
                    accessor: 'requester', // accessor is the "key" in the data                   
                },
                {
                    Header: 'Requested Date',
                    accessor: 'requestOn', // accessor is the "key" in the data        
                    width: "15%",
                },
                {
                    Header: 'Comments',
                    accessor: 'requestComments', // accessor is the "key" in the data                   
                },
                {
                    Header: 'Delete Type',
                    accessor: 'deleteType', // accessor is the "key" in the data    
                    width: "8%",
                },
                {
                    Header: 'Status',
                    width: "5%",
                    accessor: 'approvalStatus',
                    Cell: ({ row: { original } }) => {
                        switch (original.approvalStatus) {
                            case "Pending":
                                return <span className='bg-warning p-1'>{original.approvalStatus}</span>
                            case "Approved":
                                return <span className='bg-success p-1'>{original.approvalStatus}</span>
                            case "Rejected":
                                return <span className='bg-danger p-1'>{original.approvalStatus}</span>
                            default:
                                break;
                        }
                    } // accessor is the "key" in the data                   
                },
                {
                    Header: 'Action',
                    width: "8%",
                    Cell: ({ row: { original } }) => {
                        switch (original.approvalStatus) {
                            case "Pending":
                                return (
                                    <Fragment>
                                        <button
                                            className="btn btn-success btn-sm mr-1"
                                            onClick={() => this.handleApprove(original)}
                                            title="Approve"
                                        >
                                            <i className="fa fa-check"></i>
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm mr-1"
                                            onClick={() => this.handleReject(original)}
                                            title="Reject"
                                        >
                                            <i className="fa fa-ban"></i>
                                        </button>
                                    </Fragment>
                                )
                            default:
                                return (
                                    <Fragment>
                                        <button
                                            className="btn btn-warning btn-sm mr-1"
                                            onClick={() => this.handleView(original)}
                                            title="View"
                                        >
                                            <i className="fa fa-eye"></i>
                                        </button>
                                    </Fragment>
                                )
                        }
                    }
                }
            ],
            data: [],
            loading: true,
            filterType: 'Pending',
            approval: false,
            approvalTitle: null,
            approvalAction: '',
            approvalData: null,
            cardType: 'card-primary',
            grdTotalRows: 0,
            grdTotalPages: 0,
            PageSize: 10,
            PageNumber: 1,
            SearchValue: '',
            approvalDt: false,

            eventTitle: '',
            eventCurrentStatus: '',
            eventActionTakenBy: '',
            eventDate: '',
            eventComment: '',
        };
        this.ApiProviderr = new ApiProvider();
    }

    getModel = (type, comment, approvalAction, approvalData) => {
        var model = [];
        switch (type) {
            case 'U':
                model.push({
                    "Type": type,
                    "EventApprovalId": parseInt(approvalData.eventApprovalId),
                    "Comments": comment,
                    "Status": approvalAction,
                    "DelType": approvalData.deleteType,
                    "EventId": parseInt(approvalData.eventId),
                    "SubEventId": parseInt(approvalData.subEventId),
                });
                break;
            case 'R':
                model.push({
                    "cmdType": type,
                    "PropertyId": parseInt(this.props.PropertyId),
                    "SearchValue": this.state.SearchValue ? this.state.SearchValue : "NULL",
                    "FilterType": this.state.filterType,
                    "PageSize": this.state.PageSize,
                    "PageNumber": this.state.PageNumber
                });
                break;
            default:
        };
        return model;
    }

    manageEventApproval = (model, type) => {
        this.ApiProviderr.manageEventApproval(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'R':
                                this.setState({
                                    data: rData.deleteEventApprovals,
                                    grdTotalRows: rData.totalRows,
                                    grdTotalPages: rData.totalPages,
                                    loading: false
                                })
                                break;
                            case 'U':
                                appCommon.showtextalert(`Approval Status Successfully Saved!`, "", "success");
                                this.setState({ loading: false, approval: false }, () => this.getGrid())
                                break;
                            default:
                        }
                    });
                }
            });
    }

    componentDidMount() {
        this.getGrid();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.getGrid();
        }
    }

    getGrid() {
        var type = 'R';
        var model = this.getModel(type);
        this.manageEventApproval(model, type);
    }

    onHandleFilter = (e) => {
        this.setState({ filterType: e.target.value, loading: true }, () => this.getGrid())
    }

    handleView = (data) => {
        this.setState({
            approvalDt: true,
            eventTitle: data.title,
            eventCurrentStatus: data.approvalStatus,
            eventActionTakenBy: data.approver,
            eventComment: data.approvalComment,
            eventDate: data.approvedOn,
        })
    }

    handleApprove = (data) => {
        this.setState({
            approval: true,
            approvalTitle: `Approve/Reject Comment`,
            approvalData: data,
            cardType: "card-success",
            approvalAction: "Approved"
        })
    }

    handleReject = (data) => {
        this.setState({
            approval: true,
            approvalTitle: `Approve/Reject Comment`,
            approvalData: data,
            cardType: "card-danger",
            approvalAction: "Rejected"
        })
    }

    IscloseModal = () => {
        this.setState({ approval: false, approvalData: null, loading: false, cardType: 'card-primary' })
    }

    onSubmitApprovalSubmit = (comment) => {
        this.setState({ loading: true }, () => {
            var type = 'U';
            var model = this.getModel(type, comment, this.state.approvalAction, this.state.approvalData);
            this.manageEventApproval(model, type);
        })
    }

    onPageChange = (pageNumber) => {
        if (this.state.PageNumber !== pageNumber)
            this.setState({ PageNumber: pageNumber }, () => this.getGrid())
    }
    onPageSizeChange = (pageSize) => {
        this.setState({ PageSize: pageSize }, () => this.getGrid())
    }
    // onCustomSearch = (value) => {
    //     if (value !== "")
    //         this.setState({ SearchValue: value }, () => this.getGrid())
    //     else
    //         this.setState({ SearchValue: "NULL" }, () => this.getGrid())
    // }

    IscloseApprovalDtModal = () => {
        this.setState({
            approvalDt: false,
            eventTitle: '',
            eventCurrentStatus: '',
            eventActionTakenBy: '',
            eventData: '',
            eventComment: '',
        })
    }

    onEventNumberSearch = () => {
        this.setState({ loading: true }, () => this.getGrid())
    }

    render() {
        return (
            <div>
                {this.state.approvalDt &&
                    <ApproverDetails
                        IsopenModal={this.state.approvalDt}
                        IscloseModal={this.IscloseApprovalDtModal}
                        eventTitle={this.state.eventTitle}
                        eventCurrentStatus={this.state.eventCurrentStatus}
                        eventActionTakenBy={this.state.eventActionTakenBy}
                        eventDate={this.state.eventDate}
                        eventComment={this.state.eventComment}
                    />
                }
                {this.state.approval &&
                    <EventApprovalModal
                        loading={this.state.loading}
                        IsopenModal={this.state.approval}
                        IscloseModal={this.IscloseModal}
                        approvalTitle={this.state.approvalTitle}
                        cardType={this.state.cardType}
                        onSubmitApprovalSubmit={this.onSubmitApprovalSubmit}
                    />
                }
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex p-0">
                                <ul className="nav ml-auto tableFilterContainer">
                                    <li className="nav-item">
                                        <select
                                            className="form-control"
                                            value={this.state.filterType}
                                            onChange={(e) => { this.onHandleFilter(e) }}>
                                            <option value="NULL">All</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </li>
                                    <li className="nav-item">
                                        <div class="input-group mb-3">
                                            <input
                                                className="form-control"
                                                value={this.state.SearchValue}
                                                onChange={e => { this.setState({ SearchValue: e.target.value }) }}
                                                placeholder="Type Event Number"
                                            />
                                            <div class="input-group-append">
                                                <button type="button" class="btn btn-success" onClick={this.onEventNumberSearch}>Search</button>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body pt-2">
                                <LoadingOverlay
                                    active={this.state.loading}
                                    spinner={<PropagateLoader color="#336B93" size={30} />}
                                >
                                    <DataTable
                                        data={this.state.data}
                                        columns={this.state.columns}
                                        hideGridSearchAndSize={false} // if false hide search and size on grid level default and custom search  
                                        globalSearch={false}
                                        isDefaultPagination={false} // if need to enable custom pagination then set false
                                        onPageSizeChange={this.onPageSizeChange} // if custom pagignation enabled need to pass 
                                        // customSearch={this.onCustomSearch} // if custom pagignation enabled need to pass 
                                        totalPage={this.state.grdTotalPages} // if custom pagignation enabled need to pass 
                                        totalRecord={this.state.grdTotalRows} // if custom pagignation enabled need to pass 
                                        onPageChange={this.onPageChange} // if custom pagignation enabled need to pass 
                                    />
                                </LoadingOverlay>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStoreToprops(state, props) {
    return {
        PropertyId: state.Commonreducer.puidn,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(ApprovalEvents);