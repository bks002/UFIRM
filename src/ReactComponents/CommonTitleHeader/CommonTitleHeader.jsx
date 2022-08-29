import React from 'react';


class CommonTitleHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (<div>
            {this.props.Full &&
                <div className="pr-fullwidth card-title">
                    <div className="pr-heading">{this.props.HeadingName}</div>
                    {this.props.ConnId != 0 &&
                        <div className="pr-cid">{this.props.SubTitle}: {this.props.ConnId}</div>
                    }
                </div>
            }
            {this.props.Full == false &&
                <div className="pr-fullwidth">
                    <div className="pr-heading">{this.props.HeadingName}</div>
                    {this.props.ConnId != 0 &&
                        <div className="pr-cid">{this.props.SubTitle}:{this.props.ConnId}</div>
                    }

                </div>
            }
        </div>
        );
    }
}

CommonTitleHeader.defaultProps = {
    HeadingName: "Connection Maintenance",
    ConnId: 0,
    Full:true,
    SubTitle :"Connection ID"
}


export default CommonTitleHeader;