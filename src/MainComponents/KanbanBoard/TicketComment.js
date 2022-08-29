import React, { Component, Fragment } from 'react';
import { ShowImageModal } from './ImageModal'
import { ShowPdfModal } from './ShowPdf'
import PDFIcon from './AttachmentIcons/pdficon.png';
import BeatLoader from "react-spinners/BeatLoader";
const $ = window.$;
class TicketComment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showImagefilename: '',
            showImagefile: '',
            showImagefiletype: '',
            extension: '',
        }
    }


    showImage = (filename, src, type, extension) => {
        this.setState({ showImagefilename: filename, showImagefile: src, showImagefiletype: type, extension: extension },
            () => {
                $('#modal-lg-img-tkcomment').modal('show')
            })
    }
    showPdf = (filename, src, type, extension) => {
        this.setState({ showImagefilename: filename, showImagefile: src, showImagefiletype: type, extension: extension },
            () => {
                $('#modal-lg-pdf-tkcomment').modal('show')
            })
    }
    render() {
        return (
            <Fragment>
                <ShowImageModal
                    Id="modal-lg-img-tkcomment"
                    titile={this.state.showImagefilename}
                    showImagefiletype={this.state.showImagefiletype}
                    showImagefile={this.state.showImagefile}
                    extension={this.state.extension}
                />
                <ShowPdfModal
                    Id="modal-lg-pdf-tkcomment"
                    titile={this.state.showImagefilename}
                    showImagefiletype={this.state.showImagefiletype}
                    showImagefile={this.state.showImagefile}
                    extension={this.state.extension}
                />

                {
                    !this.props.ticketCommentLoading ?
                        <div className="timeline mt-1">
                            {
                                this.props.TicketComment.length > 0 ?
                                    this.props.TicketComment.map((x, i) => (
                                        <Fragment>
                                            <div className="time-label" key={i}>
                                                <span className="bg-red">{x.dateTitle}</span>
                                            </div>
                                            { //commentAttachment
                                                x.comments.map((c, d) => (
                                                    <div key={d}>
                                                        {
                                                            c.type === 'Comment' ?
                                                                <i className="fas fa-comments bg-yellow"></i>
                                                                :
                                                                <i className="fa fa-info bg-info"></i>
                                                        }
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
                                                                        c.commentAttachment.map((cat, cati) => (
                                                                            cat.extension.toLowerCase() === 'pdf' ?
                                                                                <img style={{ height: "40px", cursor: "pointer" }} alt={cat.filename}
                                                                                    className="img-thumbnail"
                                                                                    src={PDFIcon} title={cat.filename}
                                                                                    onClick={this.showPdf.bind(this, cat.filename, cat.filepath, null, cat.extension)}
                                                                                />
                                                                                :
                                                                                <img style={{ height: "40px", cursor: "pointer" }} alt={cat.filename}
                                                                                    className="img-thumbnail"
                                                                                    src={`${cat.filepath}`} title={x.filename}
                                                                                    onClick={this.showImage.bind(this, cat.filename, cat.filepath, null, cat.extension)} />
                                                                        ))
                                                                        : null
                                                                }
                                                            </div>
                                                            {/* <div className="timeline-footer">

                                                    </div> */}
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </Fragment>
                                    ))
                                    : null
                            }
                            {/* <div className="time-label">
                                                <span className="bg-red">Date</span>
                                            </div>
                                            <div>
                                                <i className="fas fa-comments bg-yellow"></i>
                                                <div className="timeline-item">
                                                    <span className="time"><i className="fas fa-clock"></i> Time</span>
                                                    <h3 className="timeline-header">
                                                        <img
                                                            alt="NA"
                                                            src={this.props.EditTicktDetails.CardReoprterImg}
                                                            width="50px"
                                                            height="50px"
                                                            className="img-circle"
                                                        /> Name
                                                    </h3>
                                                    <div className="timeline-body">
                                                        comment
                                                    </div>
                                                    <div className="timeline-footer">

                                                    </div>
                                                </div>
                                            </div> */}
                        </div>
                        : <BeatLoader
                            loading={this.props.ticketCommentLoading}
                            size={30}
                            color="#336B93"
                        />
                }

            </Fragment>

        );
    }
}

export default TicketComment;