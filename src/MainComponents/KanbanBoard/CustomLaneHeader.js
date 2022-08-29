
import React from 'react';

export const MyLane = props => {
    // console.log(props);
    let style = '';
    if (props.title === "OPEN") {
        style = { backgroundColor: "#e46c5f", color: "#ffffff", fontSize: 16, fontWeight: 'bold', padding: "6px" }
    }
    else if (props.title === "IN PROGRESS") {
        style = { backgroundColor: "#20639B", color: "#ffffff", fontSize: 16, fontWeight: 'bold', padding: "6px" }

    }
    else if (props.title === "RESOLVED") {
        style = { backgroundColor: "#3CAEA3", color: "#ffffff", fontSize: 16, fontWeight: 'bold', padding: "6px" }
    }
    else if (props.title === "CLOSED") {
        style = { backgroundColor: "#7AC968", color: "#ffffff", fontSize: 16, fontWeight: 'bold', padding: "6px" }
    }

    return (
        <div>
            <header>
                <div style={style}>
                    {props.title}
                    <span className="badge badge-light float-right">{props.cards.length}</span>
                </div>
            </header>
        </div>
    )
}