/* eslint-disable max-len */
//import { createSelector } from 'reselect';
import { MONTHS } from './constants';
import { getMonthsRoundOff } from '../../utility/common';
// eslint-disable-next-line

// Helper function business logic specific

const calculateYearlyQuantity = (
  { BusinessStartDate, BusinessEndDate },
  totalQuantity,
  sizeBow,
  itemTotalQuantity,
) => {
  console.log('Sdsdfsdf', getMonthsRoundOff(BusinessStartDate, BusinessEndDate));
  return (itemTotalQuantity ? ((itemTotalQuantity * 12) / getMonthsRoundOff(BusinessStartDate, BusinessEndDate)) : Math.floor(
    (totalQuantity / getMonthsRoundOff(BusinessStartDate, BusinessEndDate)) * 12 * sizeBow / 100,
  ));
};

const selectPageDomain = () => state => (typeof state.ForeCast === 'undefined' ? '' : state.ForeCast.toJS());
const selectOpportunityDetails = () => state => (typeof state.ForeCast === 'undefined' ? '' : state.ForeCast.toJS().opportunityDetails);

// const makeDirtyData = () => createSelector(
//   selectPageDomain(),
//   substate => substate.dirty,
// );


// const makeLoading = () => createSelector(
//   selectPageDomain(),
//   substate => substate.loading,
// );

// const makeLoadingStatus = () => createSelector(
//   selectPageDomain(),
//   substate => Object.values(substate.validations).every(flag => flag === true),
// );

// const makeOpportunityDetails = () => createSelector(
//   selectOpportunityDetails(),
//   substate => substate,
// );

// const makeOpportunityDuration = () => createSelector(
//   selectPageDomain(),
//   (substate) => {
//     const { BusinessStartDate, BusinessEndDate } = substate.opportunityDetails;
//     if (BusinessEndDate && BusinessEndDate) {
//       return { period: getMonthsRoundOff(BusinessStartDate, BusinessEndDate), initialMonth: parseInt(BusinessStartDate.split('/')[1], 0) };
//     }
//     return { preriod: 0, initialMonth: 0 };
//   },
// );

// const makeMonthlyDistribution = () => createSelector( // esint-disable-line
//   selectPageDomain(),
//   substate => substate.monthDistribution,
// );


// const makeForeCastData = () => createSelector( // esint-disable-line
//   selectPageDomain(),
//   // eslint-disable-next-line max-len
//   substate => Object.entries(substate.foreCastData).reduce((revisedData, [productKey, productData]) => {
//     const tmpRevisedData = {
//       ...revisedData,
//       [productKey]: {
//         ...productData,
//         ITEMS: productData.ITEMS && Object.entries(productData.ITEMS).reduce((revisedItemData, [itemKey, itemData]) => {
//           const newRowRatio = itemData.TOTAL_QUANTITY_OPPORTUNITY && (itemData.TOTAL_QUANTITY_OPPORTUNITY * 100) / productData.QUANTITY;
//           const tmpRevisedItemData = {
//             ...revisedItemData,
//             [itemKey]: {
//               ...itemData,
//               // TOTAL_QUANTITY: parseInt(calculateYearlyQuantity(opportunityDetails, productData.QUANTITY, itemData.ROW_RATIO, itemData.TOTAL_QUANTITY_OPPORTUNITY), 0),
//               // TOTAL_QUANTITY_OPPORTUNITY: 'TOTAL_QUANTITY_OPPORTUNITY' in itemData ? itemData.TOTAL_QUANTITY_OPPORTUNITY : productData.QUANTITY * itemData.ROW_RATIO / 100,
//               ROW_RATIO: newRowRatio && (itemData.ROW_RATIO - newRowRatio) !== 0 ? `${newRowRatio}% (${(itemData.ROW_RATIO - newRowRatio) * -1}%)` : `${itemData.ROW_RATIO}%`,
//             },
//           };
//           return tmpRevisedItemData;
//         }, {}),
//       },
//     };
//     return tmpRevisedData;
//   }, {}),
// );


// const makeTotalDistributionProductWise = () => createSelector(
//   makeForeCastData(),
//   substate => Object.entries(substate).reduce((requiredValue, [key, value]) => {
//     const monthlySumObject = MONTHS.reduce((totalMonthWise, month) => {
//       const values = value.ITEMS && Object.values(value.ITEMS).map(item => item.DISTRIBUTION[month]);
//       const total = values ? values.reduce((sum, item) => sum + (parseInt(item, 0) || 0), 0) : 0;
//       Object.assign(totalMonthWise, {
//         [month]: Number.isInteger(total) ? total : total.toFixed(2),
//       });
//       return totalMonthWise;
//     }, {});

//     Object.assign(requiredValue, { [key]: monthlySumObject });
//     return requiredValue;
//   }, {}),
// );

// const makeDistributionDefaultOption = () => createSelector(
//   selectPageDomain(),
//   substate => substate.distributionConfig,
// );

const makeErrorMessages = () => (
  'this is error'
  
);


export {
  
  makeErrorMessages,
   
};
