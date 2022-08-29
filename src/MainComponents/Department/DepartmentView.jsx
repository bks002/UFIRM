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
                    <div class="modal-content">
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label for="ticketType">Department Name</label>
                                        <div class="dummyBox">
                                            {this.props.Data.departmentName}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label for="ticketTitle">Description</label>
                                        <div class="dummyBox">
                                            {this.props.Data.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
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