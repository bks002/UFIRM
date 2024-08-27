import React, { Component, Fragment } from 'react';
import swal from 'sweetalert';
import moment from 'moment';

import * as appCommon from '../../Common/AppCommon';
import Button from '../../ReactComponents/Button/Button.jsx';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import DocumentUploader from '../../ReactComponents/FileUploader/DocumentUploader';
import InputDate from '../NoticeBoard/InputDate';

import { CreateRentAgreementValidator, RentAgreementValidateControls } from './Validation';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common.js';
import { ShowImageModal } from '../KanbanBoard/ImageModal';
import { ShowPdfModal } from '../KanbanBoard/ShowPdf';

const $ = window.$;

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(','));
    // reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

class RentAgreement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gridRentAgreementHeader: [
                { sTitle: 'ID', titleValue: 'id', "orderable": false, },
                { sTitle: 'Start Date', titleValue: 'startDate', "orderable": false, },
                { sTitle: 'End Date', titleValue: 'endDate', "orderable": false, },
                { sTitle: 'File', titleValue: 'filename', "orderable": false, },
                { sTitle: 'FileData', titleValue: 'filedata', "orderable": false, bVisible: false },
                { sTitle: 'EditDocUrl', titleValue: 'editDocUrl', "orderable": false, bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "View&Delete", Index: '0', "orderable": false }
            ],

            currentSelectedFile: null,

            documentVal: '', startDate: '', endDate: ''
        }
    }

    // textbox value set
    updatetextmodel = (ctrl, val) => {
        if (ctrl === 'StartDate') {
            if (this.state.endDate) {
                let sDate = moment(val, "DD/MM/YYYY");  // specified parsed date and format
                let eDate = moment(this.state.endDate, "DD/MM/YYYY");  // specified parsed date and format
                if (sDate < eDate) {
                    this.setState({ startDate: val });
                } else {
                    this.setState({ startDate: '' });
                    appCommon.showtextalert(`${val} start date should be less then end date `, "", "error");
                }
            }
            else {
                this.setState({ startDate: val });
            }
        }
        else if (ctrl === 'EndDate') {
            if (this.state.startDate) {
                let sDate = moment(this.state.startDate, "DD/MM/YYYY");  // specified parsed date and format
                let eDate = moment(val, "DD/MM/YYYY");  // specified parsed date and format
                if (eDate > sDate) {
                    this.setState({ endDate: val });
                } else {
                    this.setState({ endDate: '' });
                    appCommon.showtextalert(`${val} end date should be greter then start date `, "", "error");
                }
            }
            else {
                this.setState({ endDate: '' });
                appCommon.showtextalert(`start date can not empty! `, "", "error");
            }
        }
    }

    onAddRentAgreement = async () => {
        CreateRentAgreementValidator();
        if (RentAgreementValidateControls()) {
            let UpFile = this.state.currentSelectedFile;
            let fileD = await toBase64(UpFile);
            var imgbytes = UpFile.size; // Size returned in bytes.        
            var imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.    
            let extension = UpFile.name.substring(UpFile.name.lastIndexOf('.') + 1);
            let res = {
                filename: UpFile.name,
                filepath: fileD[1],
                sizeinKb: imgkbytes,
                fileType: fileD[0],
                extension: extension.toLowerCase()
            }

            let data = this.props.rentAgreementDetails;
            let exist = data.some(x => x.startDate.toLowerCase() === this.state.startDate.toLowerCase()
                && x.endDate.toLowerCase() === this.state.endDate.toLowerCase());
            if (!exist) {
                let newData = {
                    id: data.length + 1,
                    startDate: this.state.startDate,
                    endDate: this.state.endDate,
                    filename: res.filename,
                    filedata: res,
                    rowType: 'Add',
                    editDocUrl: null
                }
                this.setState({ documentVal: '', startDate: '', endDate: '' }, () => this.props.getRentAgreementDetails(newData));
            }
            else {
                appCommon.showtextalert(`${this.state.startDate}-${this.state.endDate}  Already Added`, "", "error");
            }
        }
    }
    onRemoveRentAgreement(gridId) {
        let myhtml = document.createElement("div");
        myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>";
        swal({
            buttons: { ok: "Yes", cancel: "No" },
            content: myhtml,
            icon: "warning",
            closeOnClickOutside: false,
            dangerMode: true
        }).then((value) => {
            switch (value) {
                case "ok":
                    this.props.removeRentAgreementDetails(gridId);
                    appCommon.showtextalert("Rent Agreement Deleted Successfully", "", "success");
                    break;
                case "cancel":
                    // Do nothing 
                    break;
                default:
                    break;
            }
        });
    }
    
    onViewDocument(gridId) {
        let data = this.props.rentAgreementDetails.find(x => x.id === gridId);
        if (data !== null) {
            if (data.rowType === 'View') {
                this.setState({
                    showImagefilename: data.filename,
                    showImagefiletype: null,
                    showImagefile: data.editDocUrl,
                    extension: ''
                },
                    () => {
                        let ext = data.editDocUrl.substring(data.editDocUrl.lastIndexOf('.') + 1);
                        if (ext === "pdf") {
                            $('#modal-lg-pdf-RentAgreementdocumentPreview').modal('show')
                        }
                        else {
                            $('#modal-lg-rentagreementImgPreview').modal('show')
                        }
                    })
            }
            else {
                this.setState({
                    showImagefilename: data.filedata.filename,
                    showImagefiletype: data.filedata.fileType,
                    showImagefile: data.filedata.filepath,
                    extension: data.filedata.extension
                },
                    () => {
                        if (this.state.extension === "pdf") {
                            $('#modal-lg-pdf-RentAgreementdocumentPreview').modal('show')
                        }
                        else {
                            $('#modal-lg-rentagreementImgPreview').modal('show')
                        }
                    })
            }
        }
    }

    // Document change
    onFileChange(event) {
        let _validFileExtensions = ["jpg", "jpeg", "png", "pdf"];
        if (event.target.files[0]) {
            let extension = event.target.files[0].name.substring(event.target.files[0].name.lastIndexOf('.') + 1);
            let isvalidFiletype = _validFileExtensions.some(x => x === extension.toLowerCase());
            if (isvalidFiletype) {
                this.setState({ documentVal: event.target.value, currentSelectedFile: event.target.files[0] })
            }
            else {
                this.setState({ documentVal: '', currentSelectedFile: null })
                let temp_validFileExtensions = _validFileExtensions.join(',');
                appCommon.showtextalert(`${event.target.files[0].name.filename} Invalid file type, Please Select only ${temp_validFileExtensions} `, "", "error");
            }
        }
    };

    render() {
        return (
            <Fragment>
                <ShowImageModal
                    Id="modal-lg-rentagreementImgPreview"
                    titile={this.state.showImagefilename}
                    showImagefiletype={this.state.showImagefiletype}
                    showImagefile={this.state.showImagefile}
                    extension={this.state.extension}
                />

                <ShowPdfModal
                    Id="modal-lg-pdf-RentAgreementdocumentPreview"
                    titile={this.state.showImagefilename}
                    showImagefiletype={this.state.showImagefiletype}
                    showImagefile={this.state.showImagefile}
                    extension={this.state.extension}
                />

                <div className="card card-default">
                    <div className="card-header">
                        <h3 className="card-title">Rent Agreement Details</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="txtStartDate">Start Date</label>
                                    <InputDate
                                        Id='txtStartDate'
                                        DateFormate="dd/mm/yyyy"
                                        value={this.state.startDate}
                                        handleOnchage={this.updatetextmodel.bind(this, "StartDate")}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="txtEndDate">End Date</label>
                                    <InputDate
                                        Id='txtEndDate'
                                        DateFormate="dd/mm/yyyy"
                                        value={this.state.endDate}
                                        handleOnchage={this.updatetextmodel.bind(this, "EndDate")}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="fileDocumentId">File</label>
                                    <DocumentUploader
                                        Class={"form-control"}
                                        Id={"rentagreementfileDocumentUploader"}
                                        type={"file"}
                                        value={this.state.documentVal}
                                        onChange={this.onFileChange.bind(this)}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <br></br>
                                    <Button
                                        Id="btnAddMoreRentAgreement"
                                        Text="Add"
                                        Action={this.onAddRentAgreement.bind(this)}
                                        ClassName="btn btn-info mt-2" />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <DataGrid
                                    Id="grdRentAgreementDetails"
                                    IsPagination={false}
                                    ColumnCollection={this.state.gridRentAgreementHeader}
                                    onGridViewMethod={this.onViewDocument.bind(this)}
                                    onGridDeleteMethod={this.onRemoveRentAgreement.bind(this)}
                                    GridData={this.props.rentAgreementDetails.filter(item => item.rowType !== 'Delete')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default RentAgreement;