import React from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import '../AttachmentViewers.css'
function ApproverDetails(props) {

    return (

        <Modal
            open={props.IsopenModal}
            onClose={props.IscloseModal}
            center
            classNames={{
                overlay: 'customOverlay',
                modal: 'customModal',
            }}>
            <div className={`card card-warning`}>
                <div className="card-header">
                    <h3 className="card-title" style={{ color: "#fff" }}>Approval Details</h3>
                </div>
                <div className="card-body" style={{ width: "500px" }}>
                    <div className='row'>
                        <table className='table table-bordered'>
                            <tr>
                                <td>Event</td>
                                <td>{props.eventTitle}</td>
                            </tr>
                            <tr>
                                <td>Current Status</td>
                                <td>{props.eventCurrentStatus}</td>
                            </tr>
                            <tr>
                                <td>Action Taken By</td>
                                <td>{props.eventActionTakenBy}</td>
                            </tr>
                            <tr>
                                <td>Date</td>
                                <td>{props.eventDate}</td>
                            </tr>
                            <tr>
                                <td>Comment</td>
                                <td>{props.eventComment}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div className="card-footer">
                    <button
                        className="btn btn-secondary float-right"
                        onClick={props.IscloseModal}>
                        Cancel
                    </button>
                </div>
            </div>
        </Modal >

    );
}

export default ApproverDetails;