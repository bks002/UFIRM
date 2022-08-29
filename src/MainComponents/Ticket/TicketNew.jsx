import React from 'react';
import Button from '../../ReactComponents/Button/Button.jsx';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import departmentactions from '../../Redux/department/actions.js';
import HomeContainer from '../../AppContainers/home/homecontainer.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import TextAria from '../../ReactComponents/TextAreaBox/TextAreaBox.jsx';
const $ = window.$;

class TicketNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    // savediscount(){
    //     const departmentname='testDepartment';
    //     const description ='test description'
    //     alert('Saved...');
    // }
    onpagecancel() {
        this.props.Action();
    }
    render() {

        return (

            <div>
            <div >
                <div class="modal-content">
                    {/* <div class="modal-header">
                        <h4 class="modal-title">New/Edit Ticket</h4>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div> */}
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="ticketType">Type</label>
                                    <select class="form-control form-control-sm" id="ticketType">
                                        <option>IT</option>
                                        <option>option 2</option>
                                        <option>option 3</option>
                                        <option>option 4</option>
                                        <option>option 5</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="ticketTitle">Title</label>
                                    <input name="Ticket Title" type="email" class="form-control form-control-sm" id="ticketTitle" placeholder="Title"></input>
                                </div>
                            </div>                            
                        </div>
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group">
                                    <label for="ticketDescription">Description</label>
                                    <textarea name="Ticket Description" id="ticketDescription" rows="2" class="form-control form-control-sm"  placeholder="Enter decsription here..."></textarea>
                                </div>
                            </div>                           
                        </div>
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="ticketPriority">Priority</label>
                                    <select class="form-control form-control-sm" id="ticketPriority">
                                        <option>IT</option>
                                        <option>High</option>
                                        <option>Low</option>
                                        <option>Medium</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="ticketPriorityCode">Property Code</label>
                                    <select class="form-control form-control-sm" id="ticketPriorityCode">
                                        <option>PRC201225</option>
                                        <option>PRC201224</option>
                                        <option>PRC201223</option>
                                        <option>PRC201222</option>
                                    </select>
                                </div>
                            </div>                            
                        </div>
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="ticketAssignedType">Assigned Type</label>
                                    <select class="form-control form-control-sm" id="ticketAssignedType">
                                        <option>Member/Team</option>
                                        <option>op2</option>
                                        <option>op3</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="ticketPriorityCode">Assigned To</label>
                                    <div class="has-search">
                                        <span class="fa fa-search form-control-feedback"></span>
                                        <input type="text" 
                                        class="form-control form-control-sm" id="ticketAssignedType"></input>
                                    </div>
                                </div>
                            </div>                            
                        </div>
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="ticketExpectedClose">Expected Close</label>
                                    <div class="input-group input-group-sm">                                            
                                        <input type="text" class="form-control  float-right singleCalendar" id="ticketExpectedClose"></input>
                                        <div class="input-group-append">
                                            <span class="input-group-text">
                                                <i class="far fa-calendar-alt"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="ticketEstimates">Estimates</label>
                                    <input type="text" class="form-control form-control-sm" id="ticketEstimates" placeholder="3w ld 2h 2m"></input>
                                </div>
                            </div>                            
                        </div>
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group">
                                    <label for="ticketTicketAttachments">Ticket Attachments</label>
                                    <input type="file" name="file" class="form-control form-control-sm" multiple ></input>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group mb-0">
                                    <label for="ticketEstimates">Comments</label>
                                    <div class="card-footer card-comments ticketComment">
                                        <div class="card-comment">
                                            {/* <!-- User image --> */}
                                            <img class="img-circle img-sm" src="../../dist/img/user3-128x128.jpg" alt="User Image"></img>
    
                                            <div class="comment-text">
                                                <span class="username">
                          Maria Gonzales
                          <span class="text-muted float-right">8:03 PM Today</span>
                                                </span>
                                                {/* <!-- /.username --> */}
                                                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                                            </div>
                                            {/* <!-- /.comment-text --> */}
                                        </div>
                                        {/* <!-- /.card-comment --> */}
                                        <div class="card-comment">
                                            {/* <!-- User image --> */}
                                            <img class="img-circle img-sm" src="../../dist/img/user4-128x128.jpg" alt="User Image"></img>
    
                                            <div class="comment-text">
                                                <span class="username">
                          Luna Stark
                          <span class="text-muted float-right">8:03 PM Today</span>
                                                </span>
                                                {/* <!-- /.username --> */}
                                                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                                            </div>
                                            {/* <!-- /.comment-text --> */}
                                        </div>
                                        {/* <!-- /.card-comment --> */}
                                    </div>
                                     {/* <!-- /.card-footer --> */}
                                <div class="card-footer">
                                    <img class="img-fluid img-circle img-sm" src="../../dist/img/user4-128x128.jpg" alt="User Image"></img>
                                    {/* <!-- .img-push is used to add margin to elements next to floating images --> */}
                                    <div class="img-push">
                                        <textarea type="text" rows="3" class="form-control form-control-sm" placeholder="Press enter to post comment"></textarea>
                                    </div>
                                </div>
                                </div>
                            </div>                              
                        </div>
                    </div>

                    
                    <div class="modal-footer justify-content-between">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary">Save changes</button>
                    </div>
                </div>
                {/* <!-- /.modal-content --> */}
            </div>
            {/* <!-- /.modal-dialog --> */}
        </div>
        )

    }
}

export default TicketNew;
TicketNew.defaultProps = {
    Id: 'divDepartmentNew'

}