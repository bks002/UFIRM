import React, { Fragment } from 'react';

function Logs(props) {
    return (
        <Fragment>
            {
                props.logs.length > 0 ?
                    props.logs.map((x, i) => (
                        <Fragment>
                            <div className="time-label" key={i}>
                                <span className="bg-red">{x.dateTitle}</span>
                            </div>
                            {
                                x.logs.map((c, index) => (
                                    <div key={`${x.dateTitle}_${index}`}>
                                        <i className="fa fa-info bg-info"></i>
                                        <div className="timeline-item">
                                            <span className="time"><i className="fas fa-clock"></i> {c.time}</span>
                                            <h3 className="timeline-header">
                                                <img
                                                    alt={c.logby}
                                                    src={c.profileImageUrl}
                                                    width="26px"
                                                    height="26px"
                                                    className="img-circle"
                                                />
                                                &nbsp;&nbsp; {c.logby}
                                            </h3>
                                            <div className="timeline-body">
                                                {c.action}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </Fragment>
                    )) : null
            }
        </Fragment>
    );
}

export default Logs;