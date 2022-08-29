/* eslint-disable max-len */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { bindActionCreators } from 'redux';
import { PropTypes } from 'prop-types';
import swal from 'sweetalert';

// Import Components
import Button from '../../components/shared/Button';
import Table from '../../components/shared/Table';

// Import Selectores
import {
  makeForeCastData,
  makeMonthlyDistribution,
  makeTotalDistributionProductWise,
  makeDistributionDefaultOption,
  makeDirtyData,
  makeLoading,
  makeLoadingStatus,
  makeOpportunityDuration,
  makeOpportunityDetails,
  makeErrorMessages,
} from './selectors';

// Import Other
import foreCastActions from '../../redux/forecast/actions';
import '../../styles/style.scss';
import {
  MONTHS, TABLE_CONFIG, SUBTABLE_CONFIG,
} from './constants';
import ShowMonthDistribution from '../../components/Main/ShowMonthDistribution';
import { DirtyDataProvider } from '../../components/Main/DirtyDataContext';
import { promiseWrapper } from '../../utility/common';

class ForeCast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connectionError: false,
    };
  }

  async componentDidMount() {
    // const connectionError = await promiseWrapper(this.props.actions.checkCRMConnection, {});
    const { connectionError, opportunityData } = await promiseWrapper(this.props.actions.fetchOpportunityDetails, {});
    if (connectionError) {
      this.setState({ connectionError });
    } else {
      this.props.actions.setOpportunityData(opportunityData);
      promiseWrapper(this.props.actions.fetchDistributionProfile, {}).then((data) => {
        this.props.actions.setDistributionProfile(data);
      });
      promiseWrapper(this.props.actions.fetchForecast, {}).then((data) => {
        // condition here
        this.props.actions.setCleanedForeCastValue(data);
        console.log('calling from component did mount');
        // this.handleDistributionChange();
      }).catch((error) => {
        console.log(error);
      });
    }
  }


  // componentWillReceiveProps(nextProps) {
  //   if (Object.keys(this.props.foreCastData).length && !checkIfEqualObject(nextProps.foreCastData, this.props.foreCastData)) {
  //     console.log('calling from componentWillReceiveProps', this.props.foreCastData);
  //     this.handleDistributionChange();
  //   }
  // }

  // componentDidUpdate = (prevProps) => {
  //   if (!checkIfEqualObject(prevProps.monthDistribution, this.props.monthDistribution)) {
  //     console.log('calling from componentDidUpdate 1');
  //     this.handleDistributionChange();
  //   } else if (!Object.entries(prevProps.foreCastData).every(
  //     // eslint-disable-next-line eqeqeq
  //     ([key, value]) => this.props.foreCastData[key].QUANTITY == value.QUANTITY,
  //   )) {
  //     console.log('calling from componentDidUpdate 2');
  //     this.handleDistributionChange();
  //   }
  // }

  handleDistributionChange = () => {
    this.props.actions.updateItemDistribution();
  }

  handleDistributionClick = (values) => {
    swal('Are you sure you want change monthly profile ?', {
      buttons: ['No', 'Yes'],
    }).then((value) => {
      if (value) {
        const data = MONTHS.reduce((acc, month, index) => {
          Object.assign(acc, { [month]: values[index] });
          return acc;
        }, {});
        this.props.actions.updateMonthDistribution(data);
      }
    });
  }

  handleDeleteItemClick = (productId, ItemId) => {
    this.props.actions.deleteItem(productId, ItemId);
  }

  handleUpdateMonthDistribution = (event, month) => {
    const data = { ...this.props.monthDistribution, [month]: event.target.value };
    this.props.actions.updateMonthDistribution(data);
  }

  handleSave = () => {
    if (this.props.isDataValid) {
      swal('Are you sure you want to save values ?', {
        buttons: ['No', 'Yes'],
      }).then((value) => {
        if (value) {
          promiseWrapper(this.props.actions.setForeCastData, { data: 'data' }).then(() => {
            // eslint-disable-next-line no-
          });
        }
      });
    } else {
      swal('Invalid data!', Object.values(this.props.errorMessages).join('\n'), 'error');
    }
  }

  handleReset = () => {
    swal('Are you sure you want to reset values ?', {
      buttons: ['No', 'Yes'],
    }).then((value) => {
      if (value) {
        this.props.actions.resetForeCastData();
        this.props.actions.updateItemDistribution();
      }
    });
  }


  render() {
    return (
      <React.Fragment>
        <div id="crmMasthead">
          <span>Opportunity   &gt;  Forecast</span>
        </div>
        { !this.state.connectionError
          ? (
            <div className="forecast-screen">
              <div className="crm-info bd-box">
                <div className="info-table">
                  <p>
                    <span>Account</span>
                    <span>{this.props.opportunityDetail.AccountName}</span>
                  </p>
                  <p>
                    <span>Opportunity</span>
                    <span>{this.props.opportunityDetail.OpportunityName}</span>
                  </p>
                  <p>
                    <span>Opportunity Stage</span>
                    <span>{this.props.opportunityDetail.OpportunityStage}</span>
                  </p>
                  <p>
                    <span>Owner</span>
                    <span>{this.props.opportunityDetail.Owner}</span>
                  </p>
                </div>
                <div className="info-table">
                  <p>
                    <span>Created By</span>
                    <span>{this.props.opportunityDetail.CreatedBy}</span>
                  </p>
                  <p>
                    <span>Updated By</span>
                    <span>{this.props.opportunityDetail.UpdatedBy}</span>
                  </p>
                  <p>
                    <span>Created On</span>
                    <span>{this.props.opportunityDetail.CreatedOn}</span>
                  </p>
                  <p>
                    <span>Updated On</span>
                    <span>{this.props.opportunityDetail.UpdatedOn}</span>
                  </p>
                </div>
                <div className="info-table">
                  <p>
                    <span>Business Start Date</span>
                    <span>{this.props.opportunityDetail.BusinessStartDate}</span>
                  </p>
                  <p>
                    <span>Business End Date</span>
                    <span>{this.props.opportunityDetail.BusinessEndDate}</span>
                  </p>
                  <p>
                    <span>Currency</span>
                    <span>{this.props.opportunityDetail.AccountName}</span>
                  </p>
                  <p>
                    <span>Country</span>
                    <span>{this.props.opportunityDetail.AccountName}</span>
                  </p>
                </div>
              </div>

              <div className="forecast-detail bd-box loading_bar_container">
                {this.props.loading
                  ? (
                    <React.Fragment>
                      <div className="loading_bar" />
                      <div className="overlay" />
                    </React.Fragment>
                  )
                  : null
                }

                <div className="top-btns">
                  <div>
                    {Object.entries(this.props.distributionDefaultOption).map(([key, value]) => (
                      <Button label={key} key={key} icon="save" onClick={() => this.handleDistributionClick(value)} />
                    ))}
                  </div>
                  <div>
                    <Button label="Save" icon="save" onClick={this.handleSave} />
                    <Button label="Reset" icon="save" onClick={this.handleReset} />
                  </div>
                </div>
                <div className="main-table">
                  <DirtyDataProvider data={this.props.dirtyData}>
                    <Table
                      headers={this.props.tableConfigWithAction}
                      subtableHeaders={this.props.subtableConfigWithAction}
                      subTableFooterConfig={{
                        component: ShowMonthDistribution,
                        data: this.props.totalDistributionProductWise,
                        props: 'value',
                        errors: this.props.errorMessages,
                      }}
                      headerComponentData={{
                        MonthDistribution: {
                          data: this.props.monthDistribution,
                          initialmonth: this.props.businessduration.initialMonth,
                          onBlur: this.handleDistributionChange,
                          onChange: this.handleUpdateMonthDistribution,
                        },
                      }}
                      data={this.props.foreCastData}
                    />
                  </DirtyDataProvider>
                </div>
              </div>
            </div>
          )
          : <p>Can&apos;t stablish connection with CRM due to some error. Please check after sometimes.</p>
        }
      </React.Fragment>
    );
  }
}

ForeCast.propTypes = {
  monthDistribution: PropTypes.shape().isRequired,
  actions: PropTypes.shape().isRequired,
  foreCastData: PropTypes.shape().isRequired,
  totalDistributionProductWise: PropTypes.shape().isRequired,
  subtableConfigWithAction: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    width: PropTypes.number,
    key: PropTypes.string,
  })).isRequired,
  distributionDefaultOption: PropTypes.shape().isRequired,
  dirtyData: PropTypes.shape().isRequired,
  isDataValid: PropTypes.bool.isRequired,
  tableConfigWithAction: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  businessduration: PropTypes.shape().isRequired,
  opportunityDetail: PropTypes.shape().isRequired,
  errorMessages: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

ForeCast.defaultProps = {
  // monthDistribution: {},
};

const mapStateToProps = createStructuredSelector({
  monthDistribution: makeMonthlyDistribution(),
  foreCastData: makeForeCastData(),
  totalDistributionProductWise: makeTotalDistributionProductWise(),
  distributionDefaultOption: makeDistributionDefaultOption(),
  dirtyData: makeDirtyData(),
  loading: makeLoading(),
  isDataValid: makeLoadingStatus(),
  businessduration: makeOpportunityDuration(),
  opportunityDetail: makeOpportunityDetails(),
  errorMessages: makeErrorMessages(),
});

function mapDispatchToProps(dispatch) {
  const tableConfigWithAction = TABLE_CONFIG.map(
    item => (
      {
        ...item,
        cellAction: item.cellAction ? bindActionCreators(item.cellAction, dispatch) : null,
        headAction: item.headAction ? bindActionCreators(item.headAction, dispatch) : null,
      }),
  );
  const subtableConfigWithAction = SUBTABLE_CONFIG.map(
    item => (
      {
        ...item,
        cellAction: item.cellAction ? bindActionCreators(item.cellAction, dispatch) : null,
      }),
  );
  const actions = bindActionCreators(foreCastActions, dispatch);
  return {
    actions,
    subtableConfigWithAction,
    tableConfigWithAction,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ForeCast);
