import React, { useState } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import '../AttachmentViewers.css'
import { CreateCompleteEventValidator, ValidateCompleteEventControls } from '../Validation';

function CompleteEvent(props) {
    const [comment, setComment] = useState();
    const onSubmit = () => {
        CreateCompleteEventValidator();
        if (ValidateCompleteEventControls()) {
            props.onComplete(comment)
        }
    }
    const handleComment = (e) => {
        e.preventDefault();
        setComment(e.target.value)
    }
    return (
        <Modal
            open={props.IsCompleteModal}
            onClose={props.closeCompleteModal}
            center
            classNames={{
                overlay: 'customOverlay',
                modal: 'customModal',
            }}>

            <div className='card card-success'>
                <div className="card-header">
                    <h3 className="card-title">Complete Event</h3>
                </div>
                <div className="card-body" style={{ width: "500px" }}>
                    <div className='row'>
                        <div className='col-12 mt-3'>
                            <textarea
                                onChange={handleComment}
                                value={comment}
                                placeholder="Enter your comment here..."
                                className="form-control form-control-sm"
                                rows="3"
                                id='txtCompleteComment'
                            />
                        </div>
                    </div>
                </div>
                <div className="card-footer">
                    <button
                        className="btn btn-secondary float-right"
                        onClick={props.closeCompleteModal}>
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

export default CompleteEvent;