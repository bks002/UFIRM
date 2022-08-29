import React from 'react';
const $ = window.$;
export const ShowImageModal = (props) => {
    function onClose() {
        $(`#${props.Id}`).modal('hide')
    }
    return (
        <div className="row">
            <div className="modal fade" id={props.Id}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content" style={{ top: "20px" }}>
                        <div className="modal-header">
                            <h4 className="modal-title">{props.titile}</h4>
                            <button type="button"
                                className="close"
                                // data-dismiss="modal"
                                aria-label="Close"
                                onClick={onClose}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {
                                props.showImagefiletype !== null ?
                                    <img
                                        alt={props.titile} style={{ height: "500px", width: "768px" }}
                                        src={`${props.showImagefiletype},${props.showImagefile}`}
                                    /> :
                                    <img
                                        alt={props.titile} style={{ height: "500px", width: "768px" }}
                                        src={`${props.showImagefile}`}
                                    />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}