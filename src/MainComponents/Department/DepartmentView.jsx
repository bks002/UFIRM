import React from 'react';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import TextAria from '../../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import Button from '../../ReactComponents/Button/Button.jsx';
import Label from '../../ReactComponents/Label/Label.jsx';

class DepartmentView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleCancel = () => {
        this.props.Action("Home");
    };
    render() {
        return (
            <div>
                <div >
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Department Name</label>
                                        <div className="dummyBox">
                                            {this.props.Data.departmentName}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketTitle">Description</label>
                                        <div className="dummyBox">
                                            {this.props.Data.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button
                                Id="btnCancel"
                                Text="Cancel"
                                Action={this.handleCancel}
                                ClassName="btn btn-secondary" />
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

export default DepartmentView;