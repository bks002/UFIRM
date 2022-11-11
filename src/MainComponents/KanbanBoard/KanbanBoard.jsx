import React, { Component } from 'react';
import moment from 'moment'
import Board from 'react-trello'
import { saveAs } from "file-saver";
import LoadingOverlay from 'react-loading-overlay';

import ApiProvider from './DataProvider';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import { MyCard } from './CustomCard'
import { MyLane } from './CustomLaneHeader'
import Button from '../../ReactComponents/Button/Button.jsx';
import { Typeahead } from 'react-bootstrap-typeahead';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList';
import MultiSelectDropdown from './MultiSelectDropdown';
import * as appCommon from '../../Common/AppCommon.js';
import ClipLoader from "react-spinners/ClipLoader";
import PropagateLoader from "react-spinners/PropagateLoader";
import CreateTicket from './CreateTicket';
import { CreateValidator } from './Validation';

import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { bindActionCreators } from 'redux';


import './TicketSystem.css'
import TicketDetails from './TicketDetails';

import TicketDetailModel from './TicketDetailModel'
let TicketDetailModelInstance = new TicketDetailModel();

const $ = window.$;

class KanbanBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            data: {
                lanes: []
            },
            TicketAttachmens: [],
            EditTicktDetails:
            {
                CardId: null,
                CardTitle: '',
                CardTicketNum: '',
                CardOrigin: '',
                CardLaneName: '',
                CardLaneId: '',
                CardcreatedDate: '',
                Carddescription: '',
                Cardusername: '',
                CardReoprterImg: '',
                CardAttachment: '',
            },
            fromDate: '',
            toDate: '',
            usersList: [], UserIds: '',
            isLoaded: false,
            isReopen: '', isHold: '',
            FilterData: [{ Name: 'Ticket Number', Value: 1 }],
            CategoryData: [], selectedCategoryId: '',
            TypeAheadData: [],
            SearchValue: '',
            filterDropdownVal: 1,
            TeamMemberData: [], selectedTeamMemberId: '', isTeamMemLoaded: false,
            boardLoading: false,
            isTicketType: true,
            isTicketTypeShow: false,
            //currentRole: "Admin",
            personalPropertyTickets: 'Property',
            CategoryDataCreateAndEditTicket: [], priorityList: [], complainLocationList: [],
            ticketComments: [], ticketCommentLoading: false,
            TicketDetailModelInstance: null

        }
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    onCardClick = (cardId, metadata, laneId) => {
        // console.log(cardId, laneId);

        let laneDetails = this.state.data.lanes.filter((x) => x.id === laneId);
        let cardsDetails = laneDetails[0].cards.filter((x) => x.id === cardId)

        // console.log(cardsDetails[0]);

        this.ApiProviderr.GetticketAttachments(parseInt(cardId)).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        this.setState({ TicketAttachmens: rData }, () => {
                            this.ApiProviderr.GetEditTicketDropdownData(cardsDetails[0].ticketOrigin, parseInt(cardId)).then(
                                resp => {
                                    if (resp.ok && resp.status == 200) {
                                        return resp.json().then(rData => {
                                            this.setState({
                                                EditTicktDetails:
                                                {
                                                    CardId: parseInt(cardId),
                                                    CardTitle: cardsDetails[0].title,
                                                    CardTicketNum: cardsDetails[0].ticketNumber,
                                                    CardOrigin: cardsDetails[0].ticketOrigin,
                                                    CardLaneId: laneId,
                                                    CardcreatedDate: rData.createdDate,
                                                    Carddescription: rData.description,
                                                    Cardusername: rData.username,
                                                    CardReoprterImg: rData.profileImageUrl,
                                                    CardAttachment: this.state.TicketAttachmens,
                                                }
                                            }, () => {
                                                //categroy
                                                const existCategory = this.state.CategoryDataCreateAndEditTicket.filter(
                                                    item => item.Name === cardsDetails[0].category);

                                                //staff 
                                                if (this.state.personalPropertyTickets !== "Personal") {
                                                    const CurrentStafffilter = this.state.TeamMemberData.filter(
                                                        item => item.Name === cardsDetails[0].teamMember);
                                                    let CurrentStaff = {
                                                        Id: CurrentStafffilter[0].Id,
                                                        Name: CurrentStafffilter[0].Name,
                                                        value: CurrentStafffilter[0].Id,
                                                        label: CurrentStafffilter[0].Name, color: '#0052CC'
                                                    };
                                                    TicketDetailModelInstance.setStaff(CurrentStaff);

                                                    // complain location
                                                    const existComplainLocation = this.state.complainLocationList.filter(
                                                        item => item.label === cardsDetails[0].flatDetailNumber);

                                                    TicketDetailModelInstance.setComplainLocation(existComplainLocation[0]);
                                                }

                                                let selectedTicketLane = parseInt(laneId.split('_')[0]);

                                                if (selectedTicketLane === 1) {
                                                    TicketDetailModelInstance.setTicketstatusColor('OPEN');
                                                }
                                                else if (selectedTicketLane === 2) {
                                                    TicketDetailModelInstance.setTicketstatusColor('INPROGRESS');
                                                }
                                                else if (selectedTicketLane === 3) {
                                                    TicketDetailModelInstance.setTicketstatusColor('RESOLVED');
                                                }
                                                else if (selectedTicketLane === 4) {
                                                    TicketDetailModelInstance.setTicketstatusColor('CLOSED');
                                                }

                                                TicketDetailModelInstance.setPriority(rData.ticketPriorityId);
                                                TicketDetailModelInstance.setVisisbilty(rData.visibility);
                                                TicketDetailModelInstance.setTicketStatus(selectedTicketLane);
                                                TicketDetailModelInstance.setCategory(existCategory[0]);
                                                TicketDetailModelInstance.setHold(cardsDetails[0].isOnhold);
                                                TicketDetailModelInstance.setReopen(cardsDetails[0].isReopen);
                                                TicketDetailModelInstance.setComplainBy(rData.reportedBy);

                                                this.setState({ TicketDetailModelInstance: TicketDetailModelInstance })
                                                this.loadTicketComments(parseInt(cardId));
                                                $('#modal-lg-ticketDetail').modal('show');
                                            })
                                        });
                                    }
                                }
                            )
                        })
                    });
                }
            }
        )
    }

    onCardClose = () => {
        $('#modal-lg-ticketDetail').modal('hide');
    }

    loadTicketComments = (TicketId) => {
        this.setState({ ticketCommentLoading: true }, () => {
            this.ApiProviderr.GetticketComment(TicketId).then(
                resp => {
                    if (resp.ok && resp.status == 200) {
                        return resp.json().then(rData => {
                            this.setState({ ticketComments: rData }, () => this.setState({ ticketCommentLoading: false }))
                        });
                    }
                }
            )
        })
    }

    onDataChange = (newData) => {
        // console.log(newData);
        this.setState({ data: newData },
            () => {
                // console.log(this.state.data)
            })
    }
    handleDragEnd = (cardId, sourceLaneId, targetLaneId, position, cardDetails) => {
        // console.log(cardId, sourceLaneId, targetLaneId);
        // 1_OPEN, 2_IN PROGRESS, 3_RESOLVED, 4_CLOSED
        if (sourceLaneId === targetLaneId) {
            return true;
        }
        switch (sourceLaneId) {
            case "1_OPEN":
                if (targetLaneId === "2_IN PROGRESS") {
                    let card = parseInt(cardId);
                    let statusTypeid = parseInt(targetLaneId.split('_')[0]);
                    let logMessage = `Ticket status changed from ${sourceLaneId.split('_')[1]} To ${targetLaneId.split('_')[1]}`;
                    this.ApiProviderr.ChangeTicketStatustype("TSU", card, statusTypeid, logMessage).then(
                        resp => {
                            if (resp.ok && resp.status == 200) {
                                return resp.json().then(rData => {
                                    // has some issue drag and drop when use this with async and await not work
                                    // if (rData === 1) {
                                    //     return true;
                                    // }
                                    // else {
                                    //     return false;
                                    // }
                                });
                            }
                        });
                    return true;
                }
                else {
                    return false;
                }
            case "2_IN PROGRESS":
                if (targetLaneId === "1_OPEN" || targetLaneId === "3_RESOLVED") {
                    let card = parseInt(cardId);
                    let statusTypeid = parseInt(targetLaneId.split('_')[0]);
                    let logMessage = `Ticket status changed from ${sourceLaneId.split('_')[1]} To ${targetLaneId.split('_')[1]}`;
                    this.ApiProviderr.ChangeTicketStatustype("TSU", card, statusTypeid, logMessage).then(
                        resp => {
                            if (resp.ok && resp.status == 200) {
                                return resp.json().then(rData => {
                                });
                            }
                        });
                    return true;
                }
                else {
                    return false;
                }
            case "3_RESOLVED":
                if (targetLaneId === "2_IN PROGRESS" || targetLaneId === "4_CLOSED") {

                    let card = parseInt(cardId);
                    let statusTypeid = parseInt(targetLaneId.split('_')[0]);
                    let logMessage = `Ticket status changed from ${sourceLaneId.split('_')[1]} To ${targetLaneId.split('_')[1]}`;
                    this.ApiProviderr.ChangeTicketStatustype("TSU", card, statusTypeid, logMessage).then(
                        resp => {
                            if (resp.ok && resp.status == 200) {
                                return resp.json().then(rData => {
                                });
                            }
                        });
                    return true;
                }
                else {
                    return false;
                }
            case "4_CLOSED":
                // add close date here 
                appCommon.showtextalert("You cant move this ticket except of reopen when moving from close to review", "", "error");
                return false;
            default:
                return true;

        }
    }

    manageTickets = (model, type) => {
        this.ApiProviderr.manageTickets(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'R':
                                let data = {
                                    lanes: rData
                                }
                                this.setState({ data: data }, () => this.setState({ boardLoading: false }))
                                break;
                            case 'AU':
                                let UserData = [];
                                rData.forEach(element => {
                                    UserData.push({ Id: element.id, Name: element.text, Image: element.profileImageUrl });
                                });
                                const key = 'Id';
                                const arrayUniqueByKey = [...new Map(UserData.map(item =>
                                    [item[key], item])).values()];
                                this.setState({ usersList: arrayUniqueByKey, isLoaded: false }, () => {
                                });
                                break;
                            case 'TNUM':
                                let TicketData = [];
                                rData.forEach(element => {
                                    TicketData.push({ TicketNumber: element, Name: element });
                                });
                                this.setState({ TypeAheadData: TicketData }, () => {
                                });
                                break;
                            default:
                        }
                    });
                }
                else {
                    this.setState({ boardLoading: false, isLoaded: false })
                }
            });
    }

    loadBoradData = (ticketNo) => {
        this.setState({ boardLoading: true })
        let model = this.getModel("R", ticketNo)
        this.manageTickets(model, 'R');
    }

    loadTicketNumberData = () => {
        let model = this.getModel("TNUM")
        this.manageTickets(model, 'TNUM');
    }

    getModel = (type, ticketNo) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "StatementType": type,
                    "FromDate": this.state.fromDate,
                    "ToDate": this.state.toDate,
                    "Users": this.state.UserIds,
                    "TicketNumber": ticketNo,
                    "Onhold": this.state.isHold,
                    "Reopen": this.state.isReopen,
                    "Category": this.state.selectedCategoryId,
                    "TeamMember": this.state.selectedTeamMemberId,
                    "TicketOrigin": this.state.personalPropertyTickets,
                    "PropertyId": parseInt(this.props.PropertyId),
                });
                break;
            case 'AU':
                model.push({
                    "StatementType": type,
                    "FromDate": this.state.fromDate,
                    "ToDate": this.state.toDate,
                    "Users": '',
                    "TicketNumber": '',
                    "Onhold": this.state.isHold,
                    "Reopen": this.state.isReopen,
                    "TicketOrigin": this.state.personalPropertyTickets,
                    "PropertyId": parseInt(this.props.PropertyId),
                });
                break;
            case 'TNUM':
                model.push({
                    "StatementType": type,
                    "FromDate": this.state.fromDate,
                    "ToDate": this.state.toDate,
                    "Users": this.state.UserIds,
                    "TicketNumber": '',
                    "Onhold": this.state.isHold,
                    "Reopen": this.state.isReopen,
                    "TicketOrigin": this.state.personalPropertyTickets,
                    "PropertyId": parseInt(this.props.PropertyId),
                });
                break;
            default:
        };
        return model;
    }

    getAssigneeUsers = () => {
        this.setState({ isLoaded: true })
        let model = this.getModel("AU")
        this.manageTickets(model, 'AU');
    }

    loadCategoryData = () => {
        this.ApiProviderr.GetCategory().then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let CatData = [];
                        let CatDataCreateEdit = [];
                        rData.forEach(element => {
                            if (element.status === 1) {
                                CatData.push({ Value: element.ticketTypeId, Name: element.type });
                                // this CategoryDataCreateAndEditTicket for create and edit ticket 
                                let val = {
                                    Id: element.ticketTypeId,
                                    Name: element.type,
                                    value: element.ticketTypeId,
                                    label: element.type, color: '#0052CC'
                                };
                                CatDataCreateEdit.push(val);
                            }
                        });
                        this.setState({ CategoryData: CatData, CategoryDataCreateAndEditTicket: CatDataCreateEdit });
                    });
                }
            }
        )
    }
    loadTemmemberCategoryWiseData = (StatementType, Category, PropertyId) => {
        this.setState({ isTeamMemLoaded: true })
        this.ApiProviderr.GetTeamMember(StatementType, Category, PropertyId).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let CategoryWiseTeamMemberData = [];
                        rData.forEach(element => {
                            CategoryWiseTeamMemberData.push({ Id: element.id, Name: element.text });
                        });
                        this.setState({ TeamMemberData: CategoryWiseTeamMemberData, isTeamMemLoaded: false }, () => {
                            this.TeammemberConfig();
                        });
                    });
                }
            }
        )
    }

    loadPriorityData = () => {
        this.ApiProviderr.GetDropdownData("TP", 0, 0, 0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [{ Id: 0, Name: "Select Priority" }];
                        rData.forEach(element => {
                            let val = {
                                Id: element.id,
                                Name: element.text,
                            };
                            Data.push(val);
                        });
                        const filtereData = Data.filter((item) => item.Name !== "Any");
                        this.setState({ priorityList: filtereData });
                    });
                }
            }
        )
    }

    loadComplainLocationData = () => {
        this.ApiProviderr.GetDropdownData("CL", this.props.PropertyId, 0, 0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [];
                        rData.forEach(element => {
                            let val = {
                                Id: element.id,
                                Name: element.complainLocationType,
                                value: element.id, label: element.text, color: '#0052CC'
                            };
                            Data.push(val);
                        });
                        this.setState({ complainLocationList: Data });
                    });
                }
            }
        )
    }

    // Set Date rangle 
    DateRangeConfig(startDate, endDate) {
        let _this = this;
        $('#dataRange').daterangepicker({
            locale: {
                format: 'DD/MM/YYYY'
            },
            startDate: startDate,
            endDate: endDate,
        });

        $('#dataRange').on('apply.daterangepicker', function (ev, picker) {
            var startDate = picker.startDate;
            var endDate = picker.endDate;
            //alert("New date range selected: '" + startDate.format('YYYY-MM-DD') + "' to '" + endDate.format('YYYY-MM-DD') + "'");
            _this.setState({ fromDate: startDate.format('DD/MM/YYYY'), toDate: endDate.format('DD/MM/YYYY') }, () => {
                _this.loadBoradData(_this.state.TicketNumber);
                if (_this.state.UserIds === '') {
                    // get assinee users
                    _this.getAssigneeUsers();
                }
                //load tickenumber according to daterange changed
                if (_this.state.filterDropdownVal === 1) {
                    _this.loadTicketNumberData()
                }
            })
        });
    }
    // Set ticket reopen and open status dropdown
    TicektStatusConfig() {
        let _this = this;
        $('#ticketMutliSelect').multiselect(
            {
                onSelectAll: function () {
                    _this.filterOnChange();
                },
                onDeselectAll: function () {
                    _this.filterOnChange();
                },
                onChange: function (option, checked, select) {
                    _this.filterOnChange();
                },

            }

        );
    }

    // Set TeamMember dropdown (staff)
    TeammemberConfig() {
        let _this = this;
        $('#TeammemberMutliSelect').multiselect(
            {
                onSelectAll: function () {
                    _this.OnTeamMemberChange();
                },
                onDeselectAll: function () {
                    _this.OnTeamMemberChange();
                },
                onChange: function (option, checked, select) {
                    _this.OnTeamMemberChange();
                },
            }

        );
    }
    componentDidMount() {

        const startDate = moment().clone().startOf('month');
        const endDate = moment().clone().endOf('month');
        this.DateRangeConfig(startDate, endDate);

        this.setState({ fromDate: startDate.format('DD/MM/YYYY'), toDate: endDate.format('DD/MM/YYYY') }, () => {
            this.loadBoradData(this.state.TicketNumber);
            // get assinee users
            this.getAssigneeUsers();
            if (this.state.filterDropdownVal === 1) {
                this.loadTicketNumberData()
            }
        })

        this.loadCategoryData();
        this.loadPriorityData();
        this.TicektStatusConfig();
        if (this.state.personalPropertyTickets !== "Personal") {
            this.loadTemmemberCategoryWiseData("TAM", "null", this.props.PropertyId);
        }
        // hard coded role values  defualt show Property ticket  when enable personal ticket list set empty personalPropertyTickets state
        // if (this.props.Entrolval.includes("Admin") || this.props.Entrolval.includes("SuperAdmin") || this.props.Entrolval.includes("Property Manager")) {
        //     this.setState({ isTicketTypeShow: true, personalPropertyTickets: 'Personal' })
        // }
        // else {
        //     this.setState({ isTicketTypeShow: false, personalPropertyTickets: 'Personal' })
        // }

        if (this.state.personalPropertyTickets !== "Personal") {
            this.loadComplainLocationData();
            this.loadTemmemberCategoryWiseData("TAM", "null", this.props.PropertyId);
        }

    }
    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadComplainLocationData();
            this.loadTemmemberCategoryWiseData("TAM", "null", this.props.PropertyId);

            if (this.state.personalPropertyTickets !== "Personal") {
                this.loadBoradData(this.state.TicketNumber);
                // get assinee users 
                this.getAssigneeUsers();
                if (this.state.filterDropdownVal === 1) {
                    this.loadTicketNumberData()
                }
            }
        }
    }
    handleSwitchToggle = () => {
        this.setState({ isTicketType: !this.state.isTicketType },
            () => {
                if (!this.state.isTicketType) {
                    this.setState({ personalPropertyTickets: 'Property' }, () => {
                        this.loadBoradData(this.state.TicketNumber);
                        // get assinee users
                        this.getAssigneeUsers();
                        if (this.state.filterDropdownVal === 1) {
                            this.loadTicketNumberData()
                        }

                        if (this.state.selectedCategoryId != "") {
                            this.loadTemmemberCategoryWiseData("TAM", this.state.selectedCategoryId, this.props.PropertyId);
                        }
                        else {
                            this.loadTemmemberCategoryWiseData("TAM", "null", this.props.PropertyId);
                        }
                    })
                }
                else {
                    this.setState({ personalPropertyTickets: 'Personal' }, () => {
                        this.loadBoradData(this.state.TicketNumber);
                        // get assinee users
                        this.getAssigneeUsers();
                        if (this.state.filterDropdownVal === 1) {
                            this.loadTicketNumberData()
                        }
                    })
                }
            });
    }

    onAssigneeChange(data) {
        if (data != '') {
            this.setState({ UserIds: data }, () => {
                this.loadBoradData(this.state.TicketNumber);
                //load tickenumber according to Assignee changed
                if (this.state.filterDropdownVal === 1) {
                    this.loadTicketNumberData()
                }
            })
        }
        else {
            this.setState({ UserIds: '' }, () => {
                this.loadBoradData(this.state.TicketNumber)
                //load tickenumber according to Assignee changed
                if (this.state.filterDropdownVal === 1) {
                    this.loadTicketNumberData()
                }
            })
        }
    }

    OnTeamMemberChange() {
        let _this = this;
        let data = [];
        $(`#TeammemberMutliSelect :selected`).each(function (i, sel) {
            data.push($(sel).val())
        });
        let val = data.join(',');
        _this.setState({ selectedTeamMemberId: val }, () => {
            _this.loadBoradData(this.state.TicketNumber);
        })
    }

    filterOnChange() {
        let _this = this;
        let isReopenVal = '';
        let isOnholdVal = '';
        $(`#ticketMutliSelect :selected`).each(function (i, sel) {
            let curval = $(sel).val();
            if (curval === 'Re-Open') {
                isReopenVal = '1';
            }
            else if (curval === 'On Hold') {
                isOnholdVal = '1';
            }
        });
        _this.setState({ isReopen: isReopenVal, isHold: isOnholdVal }, () => {
            _this.loadBoradData(this.state.TicketNumber);
            if (_this.state.UserIds === '') {
                // get assinee users
                _this.getAssigneeUsers();
            }
            //load tickenumber according to open and reopen changed
            if (_this.state.filterDropdownVal === 1) {
                _this.loadTicketNumberData()
            }
        })
    }

    onTicketSearch = (SearchText) => {

        if (SearchText.length > 0) {
            this.setState({ SearchValue: SearchText[0].Name }, () => {
                this.loadBoradData(SearchText[0].Name);
            });
        }
        else {
            this.setState({ SearchValue: '' }, () => {
                this.loadBoradData("");
            });
        }
    }

    onTicketLoad = (arg) => {
        if (arg == '' || arg == null) {
            this.setState({ searchValue: '' }, () => {
                this.loadBoradData("");
            });
        }
        else {
            this.setState({ searchValue: arg.trim() }, () => {
                this.loadBoradData(arg.trim());
            });
        }

    }
    ClearTyeahead = (type, event) => {

        if (type == 'C') {
            var option = this.thaCustomer.props.options;
            if (!option.includes(event.target.value)) {

            }

        }
    }

    // onSelected = (val) => {
    //     if (val === "1") {
    //         //load tickenumber according filter dropdown
    //         this.setState({ filterDropdownVal: parseInt(val) }, () => this.loadTicketNumberData())
    //     }
    //     else {
    //         this.setState({ TypeAheadData: [], filterDropdownVal: 0 });
    //     }
    // }

    onCategorySelected = (val) => {
        if (val !== "0") {
            this.setState({ selectedCategoryId: val }, () => {
                this.loadBoradData(this.state.TicketNumber);
                if (this.state.personalPropertyTickets !== "Personal") {
                    this.loadTemmemberCategoryWiseData("TAM", val, this.props.PropertyId);
                }
            })
        }
        else {
            this.setState({ selectedCategoryId: '' },
                () => {
                    this.loadBoradData(this.state.TicketNumber);

                    if (this.state.personalPropertyTickets !== "Personal") {
                        this.loadTemmemberCategoryWiseData("TAM", "null", this.props.PropertyId);
                    }
                })
        } 
    }

    addNew() {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
            this.props.changePageTitile("Create New Ticket")
        });
    }

    handleCancel = () => {
        this.setState({
            PageMode: 'Home',
            UserIds: '',
            selectedCategoryId: '',
            selectedTeamMemberId: '',
            SearchValue: '',
            TeamMemberData: [],
        },
            () => {

                this.props.changePageTitile("Ticket Complains")

                const startDate = moment().clone().startOf('month');
                const endDate = moment().clone().endOf('month');
                this.DateRangeConfig(startDate, endDate);

                this.setState({ fromDate: startDate.format('DD/MM/YYYY'), toDate: endDate.format('DD/MM/YYYY') }, () => {
                    this.loadBoradData(this.state.TicketNumber);
                    // get assinee users
                    this.getAssigneeUsers();
                    if (this.state.filterDropdownVal === 1) {
                        this.loadTicketNumberData()
                    }
                })

                this.loadCategoryData();
                this.TicektStatusConfig();
                if (this.state.personalPropertyTickets !== "Personal") {
                    this.loadTemmemberCategoryWiseData("TAM", "null", this.props.PropertyId);
                }
            });
    };


    manageTicketsExportExcel = (model, type) => {
        this.ApiProviderr.manageTickets(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.blob().then(rData => {
                        switch (type) {
                            case 'Excel':
                                let fileName = moment(new Date()).format("YYYYMMDDHHmmss");
                                this.setState({ boardLoading: false }, () => saveAs(rData, `TicketDetails_${fileName}.xlsx`))
                                break;
                            default:
                        }
                    });
                }
                else {
                    this.setState({ boardLoading: false, isLoaded: false })
                }
            });
    }

    exportTicketToExcel() {
        this.setState({ boardLoading: true })
        let model = this.getModel("R", this.state.TicketNumber)
        this.manageTicketsExportExcel(model, 'Excel');
    }


    render() {
        return (
            <div className="row">
                {/* Ticket details */}
                {
                    this.state.EditTicktDetails.CardId !== null ?
                        <TicketDetails
                            EditTicktDetails={this.state.EditTicktDetails}
                            onClose={this.onCardClose.bind(this)}
                            loadBoradData={this.loadBoradData.bind(this)}
                            CategoryDataCreateAndEditTicket={this.state.CategoryDataCreateAndEditTicket}
                            priorityList={this.state.priorityList}
                            complainLocationList={this.state.complainLocationList}
                            PropertyId={this.props.PropertyId}
                            ticketComments={this.state.ticketComments}
                            ticketCommentLoading={this.state.ticketCommentLoading}
                            loadTicketComments={this.loadTicketComments.bind(this)}
                            TicketDetailModelInstance={this.state.TicketDetailModelInstance}
                        />
                        : null
                }
                {this.state.PageMode == 'Home' &&
                    <LoadingOverlay
                        active={this.state.boardLoading}
                        spinner={<PropagateLoader color="#336B93" size={30} />}
                    >
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header d-flex p-0">
                                    {/* <h3 className="card-title p-2 mt-1 pl-4 d-none d-sm-block">Filter:</h3> */}
                                    <ul className="nav ml-auto tableFilterContainer">
                                        {
                                            this.state.isTicketTypeShow ?
                                                <li className="nav-item">
                                                    <label className="switch">
                                                        <input type="checkbox"
                                                            onChange={this.handleSwitchToggle.bind(this)}
                                                            defaultChecked={this.state.isTicketType} />
                                                        <div className="slider round">
                                                            <span className="on">Personal</span>
                                                            <span className="off">Property</span>
                                                        </div>
                                                    </label>
                                                </li> : null
                                        }

                                        <li className="nav-item">
                                            <DropDownList
                                                Id="ddlTicketsystemCategory"
                                                Options={this.state.CategoryData}
                                                onSelected={this.onCategorySelected.bind(this)}
                                            />
                                        </li>
                                        <li className="nav-item">
                                            {
                                                this.state.isTeamMemLoaded === false && this.state.personalPropertyTickets !== "Personal" ?
                                                    <div className="input-group-prepend">
                                                        <select className="form-control-sm pr-0 input-group-text"
                                                            data-placeholder="Staff"
                                                            id="TeammemberMutliSelect"
                                                            multiple="multiple"  >
                                                            {this.state.TeamMemberData.map((item, idx) => (
                                                                <option key={idx} value={item.Id}
                                                                >{item.Name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    : <ClipLoader color="#336B93" loading={this.state.isTeamMemLoaded} size={30} />
                                            }
                                        </li>

                                        <li className="nav-item">
                                            {
                                                this.state.isLoaded === false ?
                                                    <MultiSelectDropdown
                                                        id="assigneeUser"
                                                        option={this.state.usersList}
                                                        onAssigneeChange={this.onAssigneeChange.bind(this)}
                                                    />
                                                    : <ClipLoader color="#336B93" loading={this.state.isLoaded} size={30} />
                                            }
                                        </li>
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="form-group">
                                                    <div className="input-group">
                                                        <div className="input-group-prepend">
                                                            <span className="input-group-text">
                                                                <i className="far fa-calendar-alt"></i>
                                                            </span>
                                                        </div>
                                                        <input type="text" className="form-control float-right" id="dataRange"></input>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>

                                        <li className="nav-item">
                                            <div className="input-group-prepend">
                                                <select className="form-control-sm pr-0 input-group-text"
                                                    data-placeholder="Status"
                                                    id="ticketMutliSelect"
                                                    multiple="multiple"  >
                                                    <option value="Re-Open">Re-Open</option>
                                                    <option value="On Hold">On Hold</option>
                                                </select>

                                            </div>
                                        </li>
                                        <li className="nav-item">
                                            <SelectBox
                                                ID="ddlTicketsystemFilter"
                                                Value={this.state.filterDropdownVal}
                                                // onSelected={this.onSelected.bind(this)}
                                                Options={this.state.FilterData}
                                                ClassName="form-control "
                                            />
                                        </li>
                                        <li className="nav-item">
                                            <Typeahead
                                                id="ticketBoardFilter"
                                                ref={(typeahead) =>
                                                    this.thaCustomer = typeahead}
                                                labelKey="TicketNumber"
                                                onChange={this.onTicketSearch}
                                                onInputChange={this.onTicketLoad}
                                                options={this.state.TypeAheadData}
                                                placeholder='Type To Search'
                                                onBlur={this.ClearTyeahead.bind(this, 'C')}
                                            />
                                        </li>

                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                    <Button id="btnNewComplain"
                                                        Action={this.addNew.bind(this)}
                                                        ClassName="btn btn-success btn-sm"
                                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                        Text="Create Ticket" />
                                                </div>
                                            </div>
                                        </li>
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                    <Button id="btnExportExcel"
                                                        Action={this.exportTicketToExcel.bind(this)}
                                                        ClassName="btn btn-default btn-sm"
                                                        Icon={<i className="fa fa-file-excel" aria-hidden="true"></i>}
                                                        Text="Export"
                                                        Title='Download Report'
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="col-md-12">
                                    <Board
                                        components={{ LaneHeader: MyLane, Card: MyCard }}
                                        onCardClick={this.onCardClick.bind(this)}
                                        onDataChange={this.onDataChange.bind(this)}
                                        handleDragEnd={this.handleDragEnd.bind(this)}
                                        style={{ backgroundColor: "whitesmoke" }}
                                        data={this.state.data}
                                        draggable={true}
                                        laneDraggable={false}
                                        // collapsibleLanes={true}
                                        cardDragClass="draggingCard"
                                    />
                                </div>
                            </div>
                        </div>
                    </LoadingOverlay>
                }
                {this.state.PageMode == 'Add' &&
                    <CreateTicket
                        handleCancel={this.handleCancel.bind(this)}
                        currentRole={this.state.currentRole}
                        tickettype={this.state.personalPropertyTickets}
                        CategoryDataCreateAndEditTicket={this.state.CategoryDataCreateAndEditTicket}
                        priorityList={this.state.priorityList}
                        complainLocationList={this.state.complainLocationList}
                    />
                }
            </div>
        );
    }
}

function mapStoreToprops(state, props) {
    return {
        PropertyId: state.Commonreducer.puidn,
        Entrolval: state.Commonreducer.entrolval,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(KanbanBoard);