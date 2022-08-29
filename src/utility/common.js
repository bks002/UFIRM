export const checkIfEqualObject = (value1, value2) => Object.keys(value1).reduce((flag, item) => {
  const tmpFlag = flag && (!!value2[item] && value1[item] === value2[item]);
  return tmpFlag;
}, true);


export const checkIfObject = value => (value && value.constructor === {}.constructor);

export const promiseWrapper = (funcDef, argumentsObj, context) => new Promise((resolve, reject) => {
  if (typeof funcDef === 'function') {
    const argumentsObjPromise = checkIfObject(argumentsObj) ? {
      ...argumentsObj,
      promise: { resolve, reject },
    } : { promise: { resolve, reject } };
    funcDef.call(context, argumentsObjPromise);
  }
});

export const sumOfObjectKeys = obj => Math.ceil(
  Object.values(obj).reduce((sum, i) => parseFloat(sum, 0) + parseFloat(i, 0) || 0, 0),
);

export const getMonthsRoundOff = (startDate, endDate) => {
  const yearsDiff = parseInt(endDate.split('/')[2], 0) - parseInt(startDate.split('/')[2], 0);
  const monthDiff = parseInt(endDate.split('/')[1], 0) - parseInt(startDate.split('/')[1], 0);
  const totalMonth = yearsDiff >= 1 ? monthDiff + yearsDiff * 12 : monthDiff;
  return totalMonth;
};


// eslint-disable-next-line max-len
export const isNaturalNumber = value => Number.isInteger(parseFloat(value, 0)) && parseInt(value, 0) > 0;

export const isValidCurrency = (value) => {
  if (parseInt(value.trim().replace(/[€$,]/g, ''), 0) > 0) {
    return true;
  }
  return false;
};

export const convertEsTojson = (esData) => {
  if (esData != undefined) {
    var data = esData['hits']['hits'].map(function (i) {
      return i['_source'];
    });
    return data;
  }
}

export const categoryListFillter = (data, structueid) => {
  if (data != undefined) {
    var filterdValues = data.filter(function (item) {
      return item.structueid == structueid;
    });
    return filterdValues;
  }
}

export const isEmpty = (data) => {
  return (data === undefined || data == null || data.length <= 0 || data == 0) ? true : false;
}

export const isFinitenumber = value => (Number.isFinite(value) || (Number.isFinite(Number(value)) && typeof value === 'string'));


const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    return result;
  }, {});
};

// export const getCountryData = (arr1, arr2, country) => {

//   let data = [];
//   let arrayUnion = [];
//   let countryName;
//   const map = new Map();
//   arr1.forEach(item => map.set(item.domain, item));
//   arr2.forEach(item => map.set(item.domain, { ...map.get(item.domain), ...item }));
//   arrayUnion.push(Array.from(map.values()));
//   arrayUnion[0].map((item, key) => {
//     countryName = country.find(item1 => item1.countryCode == item.domain)?.countryName;
//     if (item.domain != "" && item.domain != null) {
//       if (countryName == undefined) {
//         countryName = item.domain + " (Country Not Available)"
//       }
//       data.push({
//         countryName: countryName, id: key, asp: item.asp != undefined ? item.asp : "Value Not Available", minSellPrice: item.minSellPrice != undefined ? item.minSellPrice : "Value Not Available"
//       });
//     }
//   });
//   return data;
// }

const getArraySingle = (element) => {
  let arrayUnion = [];
  element.map(function (item2, i) {
    const map = new Map();
    item2.MinSellPriceList.forEach(item => map.set(item.domain, item));
    item2.AspList.forEach(item => map.set(item.domain, { ...map.get(item.domain), ...item }));
    arrayUnion.push(Array.from(map.values()));
  });
  let arraySingle = [];
  arrayUnion.map(function (item, i) {
    item.map(function (i, k) {
      arraySingle.push(i);
    });
  });
  return arraySingle;
}

const getUniqueASPGreaterValue = (objects) => {
  let mymap = new Map();
  let unique = objects.filter(el => {
    const val = mymap.get(el.domain);
    if (val) {
      if (el.asp < val.asp) {
        mymap.delete(el.domain);
        mymap.set(val.domain, el.asp);
        return true;
      } else {
        return false;
      }
    }
    mymap.set(el.domain, el.asp);
    return true;
  });
  return unique;
}


const getUniqueMSPGreaterValue = (objects) => {
  let mymap = new Map();

  let unique = objects.filter(el => {
    const val = mymap.get(el.domain);
    if (val) {
      if (el.minSellPrice < val.minSellPrice) {
        mymap.delete(el.domain);
        mymap.set(val.domain, el.minSellPrice, el.currency);
        return true;
      } else {
        return false;
      }
    }
    mymap.set(el.domain, el.minSellPrice);
    return true;
  });
  return unique;
}


// export const miniPriceCalculation = (jsdata, country, currency) => {
//   let allCurrency = currency;
//   let defaultSymbol = allCurrency.find(item => item.currencyCode == "EUR")?.symbol; //EUR is default Currency
//   let element = [];
//   let costData = [];
//   jsdata.map(function (i, k) {

//     let obj = {
//       ItemCode: jsdata[k].itemCode,
//       GMCost: jsdata[k].gmCost,
//       REPGMCost: jsdata[k].repGMCost,
//       EUASP: jsdata[k].euasp,
//       defaultSymbol: defaultSymbol,
//       AspList: getUniqueASPGreaterValue(jsdata[k].aspList), //make domain unique , taken max asp value 
//       MinSellPriceList: getUniqueMSPGreaterValue(jsdata[k].minSellPriceList) //make domain unique , taken max minsellprice value 
//     };
//     element.push(obj);
//   });

//   if (element.length > 1 && element.length != 1) {
//     let gmCostValue = element.map((item) => { return item.GMCost }).filter((item) => { return item > 0 });
//     if (gmCostValue.length != 0) {
//       let maxGMCost = Math.max.apply(Math, gmCostValue);
//       let minGMCost = Math.min.apply(Math, gmCostValue);
//       costData["GMCost"] = isEqual(minGMCost, maxGMCost) ? element[0].defaultSymbol + maxGMCost?.toFixed(5) : element[0].defaultSymbol + maxGMCost?.toFixed(5) + " - " + element[0].defaultSymbol + minGMCost?.toFixed(5);
//     } else {
//       costData["GMCost"] = 0;
//     }
//     let repGMCostValue = element.map((item) => { return item.REPGMCost }).filter((item) => { return item > 0 });
//     if (repGMCostValue.length != 0) {
//       let maxREPGMCost = Math.max.apply(Math, repGMCostValue);
//       let minREPGMCost = Math.min.apply(Math, repGMCostValue);
//       costData["REPGMCost"] = isEqual(minREPGMCost, maxREPGMCost) ? element[0].defaultSymbol + maxREPGMCost?.toFixed(5) : element[0].defaultSymbol + maxREPGMCost?.toFixed(5) + " - " + element[0].defaultSymbol + minREPGMCost?.toFixed(5);
//     } else {
//       costData["REPGMCost"] = 0;
//     }
//     let euaspCostValue = element.map((item) => { return item.EUASP }).filter((item) => { return item > 0 });
//     if (euaspCostValue.length != 0) {
//       let maxEUASP = Math.max.apply(Math, euaspCostValue);
//       let minEUASP = Math.min.apply(Math, euaspCostValue);
//       costData["EUASP"] = isEqual(minEUASP, maxEUASP) ? element[0].defaultSymbol + maxEUASP?.toFixed(5) : element[0].defaultSymbol + maxEUASP?.toFixed(5) + " - " + element[0].defaultSymbol + minEUASP?.toFixed(5);
//     } else {
//       costData["EUASP"] = 0;
//     }
//     costData["PriceList"] = [];
//     let arraySingle = getArraySingle(element);
//     let domainData = groupBy(arraySingle, 'domain');

//     Object.keys(domainData).map(function (item, index) {
//       if (item != "" && item != "null") {
//         let costObj = {};
//         let currency = !isEmpty(domainData[item][0].currency) ? allCurrency.find(item2 => item2.currencyCode == domainData[item][0].currency)?.symbol : defaultSymbol;
//         let countryName = country.find(o => o.countryCode == item)?.countryName;
//         if (countryName != undefined) {
//           costObj["countryName"] = countryName;
//           costObj["domain"] = item;
//         } else {
//           costObj["countryName"] = item + " (Country Not Available)";
//           costObj["domain"] = "";
//         }
//         let aspValue = domainData[item].map((o) => { return o.asp }).filter((x) => { return x > 0 });
//         if (aspValue.length != 0) {
//           let maxASP = Math.max.apply(Math, aspValue);
//           let minASP = Math.min.apply(Math, aspValue);
//           costObj["asp"] = isEqual(minASP, maxASP) ? currency + " " + maxASP?.toFixed(5) : currency + " " + maxASP?.toFixed(5) + " - " + currency + " " + minASP?.toFixed(5);
//         } else {
//           costObj["asp"] = 0;
//         }

//         let msellPriceValue = domainData[item].map((o) => { return o.minSellPrice }).filter((x) => { return x > 0 });
//         if (msellPriceValue.length != 0) {
//           let maxSellPrice = Math.max.apply(Math, msellPriceValue);
//           let minSellPrice = Math.min.apply(Math, msellPriceValue);
//           costObj["minSellPrice"] = isEqual(minSellPrice, maxSellPrice) ? currency + " " + maxSellPrice?.toFixed(5) : currency + " " + maxSellPrice?.toFixed(5) + " - " + currency + " " + minSellPrice.toFixed(5);
//         } else {
//           costObj["minSellPrice"] = 0;
//         }
//         costData["PriceList"].push(costObj);
//       }
//     });
//   } else {

//     costData["ItemCode"] = element[0].ItemCode;
//     costData["GMCost"] = isEmpty(element[0].GMCost) ? null : element[0].defaultSymbol + element[0].GMCost?.toFixed(5);
//     costData["REPGMCost"] = isEmpty(element[0].REPGMCost) ? null : element[0].defaultSymbol + element[0].REPGMCost?.toFixed(5);
//     costData["EUASP"] = isEmpty(element[0].EUASP) ? null : element[0].defaultSymbol + element[0].EUASP?.toFixed(5);
//     costData["PriceList"] = [];

//     let arraySingle = getArraySingle(element);
//     let domainData = groupBy(arraySingle, 'domain');

//     Object.keys(domainData).map(function (item, index) {
//       if (item != "" && item != "null") {
//         let currency = !isEmpty(domainData[item][0].currency) ? allCurrency.find(item2 => item2.currencyCode == domainData[item][0].currency)?.symbol : defaultSymbol;
//         let costObj = {};
//         let countryName = country.find(item1 => item1.countryCode == item)?.countryName;
//         if (countryName != undefined) {
//           costObj["countryName"] = countryName;
//           costObj["domain"] = item;
//         } else {
//           costObj["countryName"] = item + " (Country Not Available)";
//           costObj["domain"] = "";
//         }
//         if (domainData[item][0].asp != undefined)
//           costObj["asp"] = currency + " " + domainData[item][0].asp?.toFixed(5);
//         if (domainData[item][0].minSellPrice != undefined)
//           costObj["minSellPrice"] = currency + " " + domainData[item][0].minSellPrice?.toFixed(5);
//         costData["PriceList"].push(costObj);
//       }
//     });
//   }
//   return costData
// }

const isEqual = (min, max) => {
  return min == max;
}

export const GetQueryStringValue = (name) => {
  let url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  let results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


//   export const  GetQueryStringValue = (name) => {
//     var url = window.location.href;
//     name = name.replace(/[\[\]]/g, '\\$&');
//     var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
//         results = regex.exec(url);
//     if (!results) return null;
//     if (!results[2]) return '';
//     return decodeURIComponent(results[2].replace(/\+/g, ' '));
// }

//}

export const htmlDecode = (input) => {
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}