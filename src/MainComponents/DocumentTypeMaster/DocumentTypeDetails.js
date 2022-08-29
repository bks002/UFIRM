import React, { Component } from 'react';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import swal from 'sweetalert';
import { CreateValidator, ValidateControls } from './Validation.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';

const $ = window.$;

class DocumentTypeDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'documentTypeId', "orderable": false },
                { sTitle: 'Document Type', titleValue: 'documentType1', },
                { sTitle: 'Description', titleValue: 'description', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],

            PageMode: 'Home',

            DocumentTypeId: 0,
            DocumentType: '',
            LanguageId: 0,
            Description: '',
        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        this.loadHomagePageData();
    }

    getModel = () => {
        var mode = [{
            "documentTypeId": this.state.DocumentTypeId,
            "documentType1": this.state.DocumentType,
            "description": this.state.Description,
            "languageId": this.state.LanguageId
        }]
        return mode;
    }

    loadHomagePageData() {
        //        
        let model = this.getModel();
        this.ApiProviderr.manageDocumentTypeMaster(model, "R").then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        this.setState({ GridData: rData });
                    });

                }
            });
    }

    onPagechange = (page) => {

    }

    Addnew = () => {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
        });
    }
    findItem(id) {
        // 
        return this.state.GridData.find((item) => {
            if (item.documentTypeId == id) {
                return item;
            }
        });
    }

    ongridedit = (Id) => {
        // 
        this.setState({ PageMode: 'Edit' }, () => {
            CreateValidator();
            var rowData = this.findItem(Id)
            this.setState({ DocumentTypeId: rowData.documentTypeId });
            this.setState({ DocumentType: rowData.documentType1 });
            this.setState({ LanguageId: 0 });
            this.setState({ Description: rowData.description });
        });

    }

    onGridDelete = (Id) => {
        let myhtml = document.createElement("div");
        myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>"
        alert: (
            swal({
                buttons: {
                    ok: "Yes",
                    cancel: "No",
                },
                content: myhtml,
                icon: "warning",
                closeOnClickOutside: false,
                dangerMode: true
            }).then((value) => {
                switch (value) {
                    case "ok":
                        this.setState({ DocumentTypeId: Id.toString() }, () => {
                            var type = 'D'
                            var model = this.getModel();
                            this.mangaeSave(model, type);
                        });
                        break;
                    case "cancel":
                        break;
                    default:
                        break;
                }
            })
        );

    }

    updatetextmodel = (ctrl, val) => {
        if (ctrl == 'docType') {
            this.setState({ DocumentType: val });
        }
        else if (ctrl == 'Desc') {
            this.setState({ Description: val });
        }
    }

    handleSave = () => {
        //
        if (ValidateControls()) {
            var type = ''
            if (this.state.PageMode == 'Edit' || this.state.PageMode == 'Add')
                type = 'U'
            var model = this.getModel();
            this.mangaeSave(model, type);
        }
    }
    mangaeSave = (model, type) => {
        //         
        this.ApiProviderr.manageDocumentTypeMaster(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        // 

                        if (rData === 0) {
                            const val = model[0].documentType1.trim();
                            appCommon.showtextalert("Document Type Existed !", "", "error");
                        }
                        else {
                            if (type != 'D')
                                appCommon.showtextalert("Document Type Saved Successfully!", "", "success");
                            else
                                appCommon.showtextalert("Document Type Deleted Successfully!", "", "success");
                            this.handleCancel();
                        }
                    });
                }

            });
    }
    handleCancel = () => {
        this.setState({ DocumentTypeId: 0, DocumentType: '', LanguageId: 0, Description: '' }, () => {
            this.setState({ PageMode: 'Home' });
            this.loadHomagePageData();
        });
    };

    render() {
        return (
            <div>
                {this.state.PageMode == 'Home' &&
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex p-0">
                                    <ul className="nav ml-auto tableFilterContainer">
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                    <Button id="btnNewComplain"
                                                        Action={this.Addnew.bind(this)}
                                                        ClassName="btn btn-success btn-sm"
                                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                        Text=" Create New" />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdDocumentTypeMaster"
                                        IsPagination={false}
                                        ColumnCollection={this.state.gridHeader}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onEditMethod={this.ongridedit.bind(this)}
                                        onGridDeleteMethod={this.onGridDelete.bind(this)}
                                        DefaultPagination={false}
                                        IsSarching="true"
                                        GridData={this.state.GridData}
                                        pageSize="2000" />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {(this.state.PageMode == 'Add' || this.state.PageMode == 'Edit') &&
                    <div>
                        <div>
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="txtLandMark">Document Type</label>
                                                <InputBox Id="txtDocumentType"
                                                    Value={this.state.DocumentType}
                                                    onChange={this.updatetextmodel.bind(this, "docType")}
                                                    PlaceHolder="Document Type"
                                                    Class="form-control form-control-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="txtPinNumber">Description</label>
                                                <InputBox Id="txtdescription"
                                                    Value={this.state.Description}
                                                    onChange={this.updatetextmodel.bind(this, "Desc")}
                                                    PlaceHolder="Description"
                                                    Class="form-control form-control-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <Button
                                        Id="btnSave"
                                        Text="Save"
                                        Action={this.handleSave}
                                        ClassName="btn btn-primary" />
                                    <Button
                                        Id="btnCancel"
                                        Text="Cancel"
                                        Action={this.handleCancel}
                                        ClassName="btn btn-secondary" />
                                </div>
                            </div>

                        </div>
                        <ToastContainer
                            position="top-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                        />
                        <ToastContainer />
                    </div>
                }
            </div>
        );
    }
}

export default DocumentTypeDetails;