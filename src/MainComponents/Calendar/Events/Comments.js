import React, { Component, Fragment } from 'react';
import FileUpload from '../../NoticeBoard/FileUpload';
import * as appCommon from '../../../Common/AppCommon.js';
import Button from '../../../ReactComponents/Button/Button';
import AttachmentViewers from '../AttachmentViewers'
class Comments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isCommentBoxShow: false,
            selectedFileName: [],
            comment: '',
            showAttachmentViewerModal: false,
            filename: '',
            fileData: '',
            isImageORPdf: '',
            extension: '',
        }
    }

    // On file Change
    onFileChange(data) {
        let files = [...this.state.selectedFileName]
        if (data !== null) {
            let _validFileExtensions = ["jpg", "jpeg", "bmp", "gif", "png", "pdf"];
            // let extension = data.filename.substring(data.filename.lastIndexOf('.') + 1);
            let isvalidFiletype = _validFileExtensions.some(x => x === data.extension);
            if (isvalidFiletype) {
                let isAvailable = files.some(x => x.filename === data.filename);
                if (!isAvailable) {
                    files.push(data);
                }
                else {
                    appCommon.showtextalert(data.filename + " Already Existed !", "", "error");
                }
            }
            else {
                let temp_validFileExtensions = _validFileExtensions.join(',');
                appCommon.showtextalert(`${data.filename} Invalid file type, Please Select only ${temp_validFileExtensions} `, "", "error");
            }
        }
        this.setState({ selectedFileName: files });
    };

    RemoveFile = (x) => {
        let files = [...this.state.selectedFileName]
        const newList = files.filter(item => item.filename !== x);
        this.setState({ selectedFileName: newList })
    }

    handleSaveComment = () => {
        if (this.state.comment !== '') {
            this.props.getAddComment(this.state.comment, this.state.selectedFileName);
            this.handleCancelComment();
        }
        else {
            appCommon.showtextalert("Please Resolve validation error before submit", "", "error");
        }
    }
    handleCancelComment = () => {
        this.setState({ isCommentBoxShow: false, selectedFileName: [], comment: '' })
    }

    generateKey = (pre) => {
        return `${pre}_${new Date().getTime()}`;
    }

    showAttachment = (filename, src, type, extension) => {
        console.log(filename, src, type, extension);
        this.setState({ filename: filename, fileData: src, isImageORPdf: type, extension: extension },
            () => {
                this.setState({ showAttachmentViewerModal: true })
            })
    }

    closeAttachmentModal = () => {
        this.setState({ showAttachmentViewerModal: false })
    }

    render() {
        return (
            <Fragment>
                {this.state.showAttachmentViewerModal &&
                    <AttachmentViewers
                        showAttachmentViewerModal={this.state.showAttachmentViewerModal}
                        fileData={this.state.fileData}
                        fileName={this.state.filename}
                        isImageORPdf={this.state.isImageORPdf}
                        extension={this.state.extension}
                        closeModal={this.closeAttachmentModal}
                    />
                }

                <div style={{
                    borderTop: "1px solid gainsboro", borderBottom: "1px solid gainsboro",
                    padding: "6px", cursor: "pointer"
                }}>
                    <i className="fa fa-reply" aria-hidden="true"
                        onClick={() => this.setState({ isCommentBoxShow: !this.state.isCommentBoxShow })}>
                        <b>&nbsp;&nbsp; Comment</b></i>
                </div>
                {
                    this.state.isCommentBoxShow &&
                        this.props.isComplete === 0 &&
                        this.props.isDelete === 0
                        ?
                        <div className="mt-2">
                            <div className="form-group">
                                <textarea
                                    onChange={(e) => this.setState({ comment: e.target.value })}
                                    value={this.state.comment}
                                    placeholder="Enter your comment here..."
                                    className="form-control form-control-sm"
                                    rows="3"
                                />
                            </div>
                            <label>Attachment</label>
                            <div className="row">
                                <div className="col-sm-12 mb-2">
                                    <FileUpload
                                        id="eventAttachemtFiles"
                                        onChange={this.onFileChange.bind(this)}
                                        className="custom-file-input"
                                    />
                                </div>
                                {
                                    this.state.selectedFileName.map((x, i) => (
                                        <div className="col-sm-12" key={i} >
                                            <div className="alert alert-success" role="alert">
                                                {x.filename}
                                                <button type="button"
                                                    onClick={this.RemoveFile.bind(this, x.filename)}
                                                    className="close"
                                                >
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            <div className="mt-2 float-right">
                                <Button
                                    Id="btnSaveComment"
                                    Text="Submit"
                                    Action={this.handleSaveComment.bind(this)}
                                    ClassName="btn btn-primary mr-2"
                                />
                                <Button
                                    Id="btnCancelComment"
                                    Text="Cancel"
                                    Action={this.handleCancelComment.bind(this)}
                                    ClassName="btn  btn-danger "
                                />
                            </div>
                        </div> : null
                }
                <br></br>
                <div className="timeline mt-1">
                    {
                        this.props.eventComment.length > 0 ?
                            this.props.eventComment.map((x, i) => (
                                <Fragment>
                                    <div className="time-label" key={this.generateKey(i)}>
                                        <span className="bg-red">{x.dateTitle}</span>
                                    </div>
                                    {
                                        x.comments.map((c, d) => (
                                            <div key={this.generateKey(c.time)}>
                                                <i className="fas fa-comments bg-yellow"></i>
                                                <div className="timeline-item">
                                                    <span className="time"><i className="fas fa-clock"></i> {c.time}</span>
                                                    <h3 className="timeline-header">
                                                        <img
                                                            alt={c.name}
                                                            src={c.profileImage}
                                                            width="26px"
                                                            height="26px"
                                                            className="img-circle"
                                                        />
                                                        &nbsp;&nbsp; {c.name}
                                                    </h3>
                                                    <div className="timeline-body">
                                                        {c.comment}
                                                        <br></br>
                                                        {
                                                            c.commentAttachment.length > 0 ?
                                                                c.commentAttachment.map((cat) => (
                                                                    cat.extension.toLowerCase() === 'pdf' ?
                                                                        <img
                                                                            key={this.generateKey(cat.fileName)}
                                                                            style={{ height: "40px", cursor: "pointer" }} alt={cat.filename}
                                                                            className="img-thumbnail"
                                                                            src={this.props.PDFIcon} title={cat.filename}
                                                                            onClick={this.showAttachment.bind(this, cat.filename, cat.filepath, "pdf", cat.extension)}
                                                                        />
                                                                        :
                                                                        <img
                                                                            key={this.generateKey(cat.fileName)}
                                                                            style={{ height: "40px", cursor: "pointer" }} alt={cat.filename}
                                                                            className="img-thumbnail"
                                                                            src={`${cat.filepath}`} title={x.filename}
                                                                            onClick={this.showAttachment.bind(this, cat.filename, cat.filepath, "img", cat.extension)}
                                                                        />
                                                                ))
                                                                : null
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </Fragment>
                            ))
                            : null
                    }
                </div>
            </Fragment>
        );
    }
}

export default Comments;