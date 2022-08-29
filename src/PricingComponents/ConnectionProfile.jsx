import React from 'react';

import TextAreaBox from '../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import GridTable from'../ReactComponents/Grid/GridTable.jsx';
import CalendarJs from '../ReactComponents/Calendar/Calendar.jsx';
import Autocomplete from  "../ReactComponents/Autocomplete/Autocomplete.jsx";
 
class ConnectionProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            GridData: [
            ],
            headers: [
                { headerName: 'Account Name', field: 'accountname', order: 1 },
                { headerName: 'Account Code', field: 'accountcode', order: 2 },
                { headerName: 'Created By', field: 'createdby', order: 3 },
                { headerName: 'Start Date', field: 'startdate', order: 4 },
                { headerName: 'End Date', field: 'enddate', order: 5 },
                { headerName: 'Action', field: 'action', order: 6 }
            ]
        };
    }
    
    render() {
        return (
            <div className="pr-body card-header">
                <div className="pr-connection-main">
                    <div className="pr-fullwidth card-title">
                        <div className="pr-heading">Connection Profile</div>
                        <div className="pr-cid">
                            <ButtonComponent ClassName="d-blue-button pr-pull-right space-left" 
                                    Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                    Text=" Add"
                                    />
                        </div>
                    </div>               
                    <div className="pr-fullwidth">
                        <div className="pr-fullwidth-padd">
                            <GridTable TableHeader={this.state.headers} TableRow={this.state.GridData} />
                        </div>                        
                    </div>                    
                    <div className="pr-fullwidth-padd pr-bar-fixed">
                        <ButtonComponent ClassName="d-grey-button pr-pull-right space-left" Text="Close" />
                        <ButtonComponent ClassName="d-blue-button pr-pull-right" Text="Save" />
                    </div>
                </div>  
            </div>          
        );
    }
}
export default ConnectionProfile;

