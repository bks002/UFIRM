import React from 'react';
// import ShowMonthDistribution from '../../components/Main/ShowMonthDistribution';
// import TextField from '../../components/shared/TextField';
// import Dropdown from '../../components/shared/Dropdown';
// import MonthDistribution from '../../components/Main/MonthDistribution';
// import Label from '../../components/shared/Label';
//import foreCastActions from '../../redux/forecast/actions';
// import IconButton from '../../components/shared/IconButton';
// import { isNaturalNumber, isValidCurrency } from '../../utility/common';


export const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];


// export const TABLE_CONFIG = [
//   {
//     name: 'Product Name',
//     width: 1,
//     key: 'PRODUCT_NAME',
//     cellRender: Label,
//     defaultProps: { text: undefined },
//   },
//   {
//     name: 'Type',
//     width: 1,
//     key: 'TYPE',
//     cellRender: Dropdown,
//     cellAction: { onChange: foreCastActions.updateOpportunityType },
//     defaultProps: { options: [{ value: 'GAIN', label: 'GAIN' }, { value: 'RISK', label: 'RISK' }], value: undefined, style: { width: '55%' } },
//   },
//   {
//     name: 'Value',
//     width: 1,
//     key: 'VALUE',
//     // cellRender: props => (
//     //   // eslint-disable-next-line react/jsx-filename-extension
//     //   <TextField
//     //     {...props}
//     //     // eslint-disable-next-line react/prop-types
//     //     value={`${props.value.toLocaleString('en-US', {
//     //       style: 'currency',
//     //       currency: 'USD',
//     //     })}`}
//     //   />
//     // ),
//     cellRender: TextField,
//     cellAction: { onBlur: foreCastActions.updateProductPrice },
//     defaultProps: {
//       style: { width: '85%' },
//       value: undefined,
//       mask: (value) => {
//         let currValue;
//         if (Number.isNaN(parseInt(value, 0))) {
//           currValue = parseInt(value.replace(/[$,]/g, ''), 0) || value;
//         } else {
//           currValue = parseInt(value, 0);
//         }
//         return `${currValue.toLocaleString('en-EU', {
//           style: 'currency',
//           currency: 'EUR',
//         })}`;
//       },
//       validate: [isValidCurrency],
//     },
//   },
//   {
//     name: 'Quantity',
//     width: 1,
//     key: 'QUANTITY',
//     cellRender: TextField,
//     cellAction: { onBlur: foreCastActions.updateProductQuantity },
//     defaultProps: {
//       style: { width: 60 },
//       value: undefined,
//       validate: [isNaturalNumber],
//     },
//   },
//   {
//     render: MonthDistribution,
//     headerKey: 'MonthDistribution',
//     width: 8,
//     key: 'DISTRIBUTION',
//     // eslint-disable-next-line react/jsx-filename-extension
//     cellRender: () => <div style={{ width: '100%' }} />,
//   },
// ];

// export const SUBTABLE_CONFIG = [
//   {
//     name: '',
//     key: 'ITEM_SNO',
//     render: null,
//     cellRender: IconButton,
//     cellAction: { onClick: foreCastActions.deleteItem },
//     defaultProps: { name: 'cross', style: { width: 25 } },
//   },
//   {
//     name: 'Item Name',
//     width: 1,
//     key: 'ITEM_NAME',
//     cellRender: Label,
//     cellAction: { onClick: foreCastActions.updateMonthDistributionTest },
//     defaultProps: { text: undefined },
//   },
//   {
//     name: 'Quantity',
//     width: 1,
//     key: 'TOTAL_QUANTITY_OPPORTUNITY',
//     cellRender: TextField,
//     cellAction: { onChange: foreCastActions.updateItemQuantity },
//     defaultProps: { value: undefined, style: { width: 50 } },
//   },
//   {
//     name: 'Size Bow',
//     width: 1,
//     key: 'ROW_RATIO',
//     // eslint-disable-next-line react/prop-types
//     cellRender: Label,
//     defaultProps: { text: undefined },
//   },
//   {
//     name: '12 Month Quantity',
//     width: 1,
//     key: 'TOTAL_QUANTITY',
//     cellRender: Label,
//     defaultProps: { text: undefined },
//   },
//   {
//     name: 'Month Distribution',
//     width: 8,
//     key: 'DISTRIBUTION',
//     cellRender: ShowMonthDistribution,
//     defaultProps: { value: undefined },
//   },
// ];
