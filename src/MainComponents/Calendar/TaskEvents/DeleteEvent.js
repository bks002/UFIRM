import React, { useEffect, useState } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import '../AttachmentViewers.css'
import { CreateDeleteEventValidator, ValidateDeleteEventControls } from '../Validation';

function DeleteEvent(props) {
    const [comment, setComment] = useState();
    const [isCurrent, setIsCurrent] = useState("Current");

    const onSubmit = () => {
        CreateDeleteEventValidator();
        if (ValidateDeleteEventControls()) {
            props.getDeleteReq(comment, isCurrent)
        }
    }
    const handleStatus = (e) => {
        e.preventDefault();
        setIsCurrent(e.target.value)
    }
    const handleComment = (e) => {
        e.preventDefault();
        setComment(e.target.value)
    }
    return (
        <Modal
            open={props.IsDeleteModal}
            onClose={props.closeDeleteReqModal}
            center
            classNames={{
                overlay: 'customOverlay',
                modal: 'customModal',
            }}>

            <div className='card card-success'>
                <div className="card-header">
                    <h3 className="card-title">Delete Event</h3>
                </div>
                <div className="card-body" style={{ width: "500px" }}>
                    <div className='row'>
                        <div className='col-12'>
                            <div className="form-check-inline">
                                <label className="form-check-label">
                                    <input
                                        type="radio"
                                        onChange={handleStatus}
                                        checked={isCurrent === "Current"}
                                        value="Current"
                                        className="form-check-input"
                                        name="optradio" /> Current
                                </label>
                            </div>
                            <div className="form-check-inline">
                                <label className="form-check-label">
                                    <input
                                        type="radio"
                                        onChange={handleStatus}
                                        checked={isCurrent === "All"}
                                        className="form-check-input"
                                        value="All"
                                        name="optradio" />Series
                                </label>
                            </div>
                        </div>
                        <div className='col-12 mt-3'>
                            <textarea
                                onChange={handleComment}
                                value={comment}
                                placeholder="Enter your comment here..."
                                className="form-control form-control-sm"
                                rows="3"
                                id='txtDeleteComment'
                            />
                        </div>
                    </div>
                </div>
                <div className="card-footer">
                    <button
                        className="btn btn-secondary float-right"
                        onClick={props.closeDeleteReqModal}>
                        Cancel
                    </button>

                    <button
                        className="btn btn-success float-right mr-2"
                        onClick={onSubmit}>
                        Submit
                    </button>

                </div>
            </div>
        </Modal>
    );
}

export default DeleteEvent;