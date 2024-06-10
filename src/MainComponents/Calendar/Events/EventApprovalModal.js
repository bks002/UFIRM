import React, {useState } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import '../AttachmentViewers.css'
import * as appCommon from '../../../Common/AppCommon.js';

import LoadingOverlay from 'react-loading-overlay';
import PropagateLoader from "react-spinners/PropagateLoader";

function EventApprovalModal(props) {
    const [comment, setComment] = useState();
    const onSubmit = () => {
        !comment ?
            appCommon.showtextalert(`Please enter remark!`, "", "error")
            :
            props.onSubmitApprovalSubmit(comment)
    }
    return (

        <Modal
            open={props.IsopenModal}
            onClose={props.IscloseModal}
            center
            classNames={{
                overlay: 'customOverlay',
                modal: 'customModal',
            }}>
            <LoadingOverlay
                active={props.loading}
                spinner={<PropagateLoader color="#336B93" size={30} />}
            >
                <div className={`card ${props.cardType}`}>
                    <div className="card-header">
                        <h3 className="card-title">{props.approvalTitle}</h3>
                    </div>
                    <div className="card-body" style={{ width: "500px" }}>
                        <div className='row'>
                            <div className='col-12 mt-3'>
                                <textarea
                                    onChange={(e) => setComment(e.target.value)}
                                    value={comment}
                                    placeholder="Enter your comment here..."
                                    className="form-control form-control-sm"
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        <button
                            className="btn btn-secondary float-right"
                            onClick={props.IscloseModal}>
                            Cancel
                        </button>

                        <button
                            className={`btn ${props.cardType === 'card-danger' ? 'btn-danger' : 'btn-success'} float-right mr-2`}
                            onClick={onSubmit}>
                            Submit
                        </button>

                    </div>
                </div>
            </LoadingOverlay>
        </Modal >

    );
}

export default EventApprovalModal;