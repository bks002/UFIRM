
import React from 'react';

export const MyCard = props => {
    // console.log(props);
    // const onClickbutton = e => {
    //     console.log(props.title);
    //     e.stopPropagation();
    // }      
    // let headerTitlecolor = ''
    // if (props.laneId === '1_OPEN' && parseInt(props.remaining) < 0) {
    //     headerTitlecolor = "bg-danger";
    // }
    // else if (props.laneId === '2_IN PROGRESS') {

    // }
    // else if (props.laneId === '3_RESOLVED') {
    //     headerTitlecolor = "bg-warning";
    // }
    // else if (props.laneId === '4_CLOSED') {
    //     headerTitlecolor = "bg-success";
    // }

    let cardBorderColor = "#6c757d";
    let priorityColor = 'bg-dark';
    if (props.priority === 'High') {
        priorityColor = 'bg-danger';
        cardBorderColor = "#dc3545";
    }
    else if (props.priority === 'Medium') {
        priorityColor = 'bg-warning';
        cardBorderColor = "#ffc107";
    }
    else if (props.priority === 'Low') {
        priorityColor = 'bg-primary';
        cardBorderColor = "#336B93";
    }
    else if (props.priority === 'any') {
        priorityColor = 'bg-dark';
        cardBorderColor = "#6c757d";
    }

    let remainingColor = ''
    if (parseInt(props.remaining) < 0) {
        remainingColor = "#E11820";
    }

    return (
        <div
            onClick={props.onClick}
            className="bg-white mb-2 p-1"
            style={{ borderLeft: `5px solid ${cardBorderColor}`, width: "300px" }}
        >
            {/* <header style={{ borderBottom: '1px solid #eee', paddingBottom: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {props.title}                    
                </div>
            </header> */}
            {/* <button className="btn btn-info btn-sm" onClick={onClickbutton}>Hi</button> */}
            <div style={{ borderBottom: '1px solid #eee' }}>
                <h6 style={{ lineHeight: 1 }}><b>Title</b>: {props.title}</h6>

                <h6 style={{ marginTop: "4px", lineHeight: 1 }} >
                    <span className={priorityColor}
                        style={{ fontWeight: 'bold', paddingLeft: "6px", paddingRight: "6px" }}>
                        {props.priority} Priority
                            </span>
                </h6>

                {
                    props.ticketOrigin === 'Personal' ? null : <h6 style={{ lineHeight: 1 }}><b>Property</b>: {props.flatDetailNumber}</h6>

                }

                <h6 style={{ lineHeight: 1 }}><b>Category</b>: {props.category}</h6>

                {/* <h6 style={{ lineHeight: 1 }}>
                    <b>Reopen</b>: {props.isReopen === 1 ? 'Yes' : 'No'}
                     &nbsp;&nbsp;
                    <b>Hold</b>: {props.isOnhold === 1 ? 'Yes' : 'No'}
                </h6> */}

                {
                    props.ticketOrigin === 'Personal' ? null : <h6 style={{ lineHeight: 1 }}><b>Staff</b>: {props.teamMember}</h6>
                }
            </div>
            <div className="row">
                {/* <div className="col-md-6 mr-auto mt-1">
                    <b >Updated: </b> {props.updatedOn}
                </div> */}

                <div className="col-md-4 mr-auto mt-1">
                    <b style={{ color: remainingColor }} title="Remaining day">{props.remaining}</b>
                </div>
                <div className="col-md-8 text-right mt-1 ">
                    <span className="m-1 text-muted">{props.ticketNumber}  </span>
                    <span className="badge badge-light"><i className="fa fa-paperclip"> &nbsp; {props.attachmentCnt}</i></span>
                    <span className="badge badge-light"><i className="fa fa-comments">  &nbsp; {props.commentCnt}</i></span>
                    &nbsp;
                    <img
                        title={props.username}
                        src={props.profileImageUrl}
                        width="30px"
                        height="30px"
                        className="img-circle"
                    />
                </div>
            </div>
        </div>
    )
}