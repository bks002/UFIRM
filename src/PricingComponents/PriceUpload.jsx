import React from 'react';
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import PriceUploadList from "../PricingComponents/priceUploadList.jsx";
import PriceUploadDetails from "../PricingComponents/priceUploadDetail.jsx";
import PriceUploadSaveDocument from "../PricingComponents/priceUploadSaveDocument.jsx";
import PriceListManagement from "../PricingComponents/priceListManagement.jsx";
import { ToastContainer, toast } from 'react-toastify';
import Shield from "../ReactComponents/Shield/Shield.jsx";

class PriceUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            DisplayPage: "List",
            PriceListID: null
        };
    }

    AddNewPriceUpload() {
        $("#btnAddPriceList").hide();
        this.setState({ DisplayPage: "Save" });
    }

    ReloadPriceUploadList() {
        this.setState({ PriceListID: null });
        this.setState({ DisplayPage: "List" }, () => {
            $("#btnAddPriceList").show();
        });
    }

    ViewPriceUploadDetail(fVal) {
        this.setState({ PriceListID: fVal });
        this.setState({ DisplayPage: "Details" });
        $("#btnAddPriceList").hide();
    }

    EditPriceManagement(fVal) {
        this.setState({ PriceListID: fVal });
        this.setState({ DisplayPage: "Manage" });
        $("#btnAddPriceList").hide();
    }


    render() {
        return (
            <div className="pr-body card-header">
                <Shield CurrentUserId={priceupload.getAttribute('currentUserId')}>
                    <div className="pr-connection-main">
                        <div className="pr-fullwidth card-title">
                            <div className="pr-heading">Price List Upload</div>
                            <div className="pr-cid">
                                {priceupload.getAttribute('currentUserAccessRole') == "Edit" &&
                                    <ButtonComponent ID="btnAddPriceList" Name="btnAddPriceList" ClassName="d-blue-button pr-pull-right space-left"
                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                        Text=" Add"
                                        Action={this.AddNewPriceUpload.bind(this)}
                                    />
                                }
                            </div>
                        </div>
                        {this.state.DisplayPage == 'List' &&
                            <div className="pr-fullwidth">
                                <PriceUploadList
                                    onEditPriceManagement={this.EditPriceManagement.bind(this)}
                                    onViewDetail={this.ViewPriceUploadDetail.bind(this)} />
                            </div>
                        }
                        {this.state.DisplayPage == 'Save' &&
                            <div className="pr-fullwidth">
                                <PriceUploadSaveDocument
                                    onCancel={this.ReloadPriceUploadList.bind(this)} />
                            </div>
                        }
                        {this.state.DisplayPage == 'Details' && this.state.PriceListID &&
                            <div className="pr-fullwidth">
                                <PriceUploadDetails
                                    priceListID={this.state.PriceListID}
                                    onCancel={this.ReloadPriceUploadList.bind(this)} />
                            </div>
                        }
                        {this.state.DisplayPage == 'Manage' && this.state.PriceListID &&
                            <div className="pr-fullwidth">
                                <PriceListManagement priceListID={this.state.PriceListID} onCancel={this.ReloadPriceUploadList.bind(this)} />
                            </div>
                        }
                    </div>
                </Shield>
                <ToastContainer></ToastContainer>
            </div>
        );
    }
}
export default PriceUpload;