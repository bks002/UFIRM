import React, { Component, Fragment } from 'react';
import swal from 'sweetalert';

import * as appCommon from '../../Common/AppCommon';
import ApiProvider from './DataProvider.js';
import Button from '../../ReactComponents/Button/Button.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import DocumentUploader from '../../ReactComponents/FileUploader/DocumentUploader';

import { CreateDocumentTypeValidator, DocumentTypeValidateControls } from './Validation';
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

class DocumentsDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            documentVal: '',
            documentOwnerName: '',
            documentNumber: '',
            selectedDocumentType: 0,
            gridDocumentHeader: [
                { sTitle: 'SN', titleValue: 'id', "orderable": false, },
                { sTitle: 'Name', titleValue: 'name', "orderable": false, },
                { sTitle: 'Type', titleValue: 'type', "orderable": false, },
                { sTitle: 'Document Number', titleValue: 'documentnumber', "orderable": false, },
                { sTitle: 'File', titleValue: 'filename', "orderable": false, },
                { sTitle: 'FileData', titleValue: 'filedata', "orderable": false, bVisible: false },
                { sTitle: 'EditDocUrl', titleValue: 'editDocUrl', "orderable": false, bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "View&Delete", Index: '0', "orderable": false }
            ],
            currentSelectedFile: null,
        }
        this.ApiProviderr = new ApiProvider();
    }
    // Dropdown value set
    onSelected(name, value) {
        switch (name) {
            case "DocumentType":
                this.setState({ selectedDocumentType: value })
                break;
            case "NameDocument":
                this.setState({ documentOwnerName: value })
                break;
            default:
        }
    }
    // textbox value set
    updatetextmodel = (ctrl, val) => {
        if (ctrl == 'DocumentName') {
            this.setState({ documentOwnerName: val });
        }
    }

    onAddDocument = async () => {
        CreateDocumentTypeValidator();
        if (DocumentTypeValidateControls()) {
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

            let data = this.props.documentDtDetails;
            let documentName = this.props.documentTypedllOptions
                .find(x => x.Id === parseInt(this.state.selectedDocumentType));
            let newData = {
                id: data.length + 1,
                type: documentName.Name,
                name: this.state.documentOwnerName,
                filename: res.filename,
                filedata: res,
                typeid: parseInt(this.state.selectedDocumentType),
                documentnumber: this.state.documentNumber,
                rowType: 'Add',
                editDocUrl: null
            }

            this.setState({ selectedDocumentType: '', documentOwnerName: '', documentVal: '', documentNumber: '' },
                () => this.props.getDocumentDetails(newData));
        }
    }
    onRemoveDocument(gridId) {
        let myhtml = document.createElement("div");
        //myhtml.innerHTML = "Save your changes otherwise all change will be lost! </br></br> Are you sure want to close this page?" + "</hr>"
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
                        this.props.removeDocumentDetails(gridId)
                        appCommon.showtextalert("Document Deleted Successfully", "", "success");
                        break;
                    case "cancel":
                        //do nothing 
                        break;
                    default:
                        break;
                }
            })
        );
    }

    onViewDocument(gridId) {
        // debugger
        let data = this.props.documentDtDetails.find(x => x.id === gridId);
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
                            $('#modal-lg-pdf-documentPreview').modal('show')
                        }
                        else {
                            $('#modal-lg-documentImgPreview').modal('show')
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
                            $('#modal-lg-pdf-documentPreview').modal('show')
                        }
                        else {
                            $('#modal-lg-documentImgPreview').modal('show')
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
                    Id="modal-lg-documentImgPreview"
                    titile={this.state.showImagefilename}
                    showImagefiletype={this.state.showImagefiletype}
                    showImagefile={this.state.showImagefile}
                    extension={this.state.extension}
                />
                <ShowPdfModal
                    Id="modal-lg-pdf-documentPreview"
                    titile={this.state.showImagefilename}
                    showImagefiletype={this.state.showImagefiletype}
                    showImagefile={this.state.showImagefile}
                    extension={this.state.extension}
                />
                <div className="card card-primary">
                    <div className="card-header">
                        <h3 className="card-title">Document Details</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="ddlDocumentType">Name </label>
                                    <SelectBox
                                        Value={this.state.documentOwnerName}
                                        ID="ddlNameDocument"
                                        ClassName="form-control "
                                        onSelected={this.onSelected.bind(this, "NameDocument")}
                                        Options={this.props.namedocumentTypedllOptions}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="ddlDocumentType">Document Type </label>
                                    <SelectBox
                                        Value={this.state.selectedDocumentType}
                                        ID="ddlDocumentType"
                                        ClassName="form-control "
                                        onSelected={this.onSelected.bind(this, "DocumentType")}
                                        Options={this.props.documentTypedllOptions}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="fileDocumentId">File</label>
                                    <DocumentUploader
                                        Class={"form-control"}
                                        Id={"fileDocumentUploader"}
                                        type={"file"}
                                        value={this.state.documentVal}
                                        onChange={this.onFileChange.bind(this)}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-2">
                                <div className="form-group">
                                    <label htmlFor="txtDocumentNumber">Document Number</label>
                                    <input
                                        type="text"
                                        id="txtDocumentNumber"
                                        placeholder="Document Number"
                                        className="form-control"
                                        value={this.state.documentNumber}
                                        onChange={(e) => this.setState({ documentNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-1">
                                <div className="form-group">
                                    <br></br>
                                    <Button
                                        Id="btnAddMoreDocument"
                                        Text="Add"
                                        Action={this.onAddDocument.bind(this)}
                                        ClassName="btn btn-info mt-2" />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <DataGrid
                                    Id="grdPropertyOwnerDoc"
                                    IsPagination={false}
                                    ColumnCollection={this.state.gridDocumentHeader}
                                    onGridViewMethod={this.onViewDocument.bind(this)}
                                    onGridDeleteMethod={this.onRemoveDocument.bind(this)}
                                    GridData={this.props.documentDtDetails.filter(item => item.rowType !== 'Delete')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>

        );
    }
}

export default DocumentsDetails;