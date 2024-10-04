//import { convertEsTojson } from '../../utility/common';
import {
  call, all, takeEvery, put
} from 'redux-saga/effects';

import {
  // FETCH_STRUCTURE,
  // UPDATE_STRUCTURE,
  // FETCH_ITEMS,
  // FETCH_MINI_PRICES,
  // FETCH_ES_QUERIES,
  // //UPDATE_CURRENT_STRUCTURE,
  // UPDATE_NAVIGATION,
  // REQUEST_MISSING_INFORMATION,
  // FETCH_DOCUMENT_FILES,
  // FETCH_CURRENCY,
  // FETCH_COUNTRY,
  // PRODUCT_MEDIA,
  // PRODUCT_DOCUMENT,
  // INSERT_ERROR
  FETCH_DEPARTMENT,
  SAVE_DEPARTMENT,
  DELETE_DEPARTMENT,
  FETCH_USER,
  FETCH_PROPERTY_MEMBER,
  SAVE_USER,
  SAVE_CHANGEPASSWORD,
  DELETE_USER,
  DELETE_PROPERTYMEMBER,
  FETCH_USERTYPE,
  FETCH_OWNERTYPE,
  FETCH_RELATIONSHIPTYPE,
  FETCH_RESIDENTTYPE,
  FETCH_PROPERTYMEMBERBY_PROPERTYDETAILSID,
  FETCH_DOCUMENTTYPE,
  FETCH_PROPERTY,
  FETCH_PROPERTYOWNER,
  FETCH_PROPERTYNAME,
  FETCH_CITY,
  FETCH_USERBYID,
  FETCH_BRANCH,
  FETCH_USERROLE,
  FETCH_DEPARTMENTS,
  FETCH_VENDOR,
  FETCH_COMPANY,
  ON_PROPERTY_CHANGED,
  FETCH_DASHBOARDDATES

} from './constants';

import {
  // fetchStructure,
  // fetchItems,
  // fetchMiniPrices,
  // fetchESQuery,
  // requestMissingInformation,
  // fetchDocumentFiles,
  // productMedia,
  // fetchCurrency,
  // fetchCountry,
  // productDocument,
  // insertError
  fetchDepartment,
  saveDepartment,
  deleteDepartment,
  fetchUser,
  fetchPropertyMember,
  saveUser,
  saveChangePassword,
  deleteUser,
  deletePropertyMemberOwner,
  fetchUserType,
  fetchOwnerType,
  fetchRelationshipType,
  fetchResidentType,
  fetchPropertyMemberByPropertyDetailsID,
  fetchDocumentType,
  fetchProperty,
  fetchPropertyOwner,
  fetchPropertyName,
  fetchCity,
  fetchUserById,
  fetchBranch,
  fetchUserRole,
  fetchDepartments,
  fetchVendor,
  fetchCompany

} from './apiCalls';


export function* fetchDepartmentAll(actions) {
  // try {
  const response = yield call(fetchDepartment, actions.SearchValue, actions.PageSize, actions.PageNumber);
  if (response) {
    //
    actions.promise.resolve(response.data);
    //yield put({ type: UPDATE_STRUCTURE, payload: response.data });
    //  }
    // } catch (error) {
    //  
    //  actions.promise.reject();
  }
}

export function* saveDepartmentNew(actions) {
  // try {
  //
  const response = yield call(saveDepartment, actions.data);
  //
  if (response) {
    actions.promise.resolve(response.data);
    //yield put({ type: UPDATE_STRUCTURE, payload: response.data });
    //  }
    // } catch (error) {
    //  
    //  actions.promise.reject();
  }
}


export function* deleteDepartmentItems(actions) {
  // try {
  //
  const response = yield call(deleteDepartment, actions.departmentId);
  //
  if (response) {
    actions.promise.resolve(response.data);
    //yield put({ type: UPDATE_STRUCTURE, payload: response.data });
    //  }
    // } catch (error) {
    //  
    //  actions.promise.reject();
  }
}


export function* fetchUserAll(actions) {
  const response = yield call(fetchUser, actions.SearchValue, actions.PageSize, actions.PageNumber);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* fetchPropertyMemberAll(actions) {
  const response = yield call(fetchPropertyMember,actions.PropertyId,actions.PropertyMemberType, actions.SearchValue, actions.PageSize, actions.PageNumber);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* saveUserNew(actions) {
  
  const response = yield call(saveUser, actions.data);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* saveChangePasswordNew(actions) {
  const response = yield call(saveChangePassword, actions.data);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* deleteUserItems(actions) {
  const response = yield call(deleteUser, actions.userId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* deletePropertyOwnerItems(actions) {
  const response = yield call(deletePropertyMemberOwner, actions.propertyMemberId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}


export function* fetchUserTypeAll(actions) {
  const response = yield call(fetchUserType, actions.UserTypeId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* fetchOwnerTypeAll(actions) {
  const response = yield call(fetchOwnerType, actions.OwnerTypeId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* fetchRelationshipTypeAll(actions) {
  const response = yield call(fetchRelationshipType, actions.RelationshipTypeId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* fetchResidentTypeAll(actions) {
  const response = yield call(fetchResidentType, actions.ResidentTypeId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* fetchPropertyMemberByPropertyDetailsIDAll(actions) {
  const response = yield call(fetchPropertyMemberByPropertyDetailsID, actions.PropertyDetailsId, actions.IsOwner);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* fetchDocumentTypeAll(actions) {
  const response = yield call(fetchDocumentType, actions.DocumentTypeId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* fetchPropertyAll(actions) {
  const response = yield call(fetchProperty, actions.PropertyId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* fetchPropertyOwnerAll(actions) {
  const response = yield call(fetchPropertyOwner, actions.ParentMemberId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* fetchPropertyNameAll(actions) {
  const response = yield call(fetchPropertyName, actions.ParkingAreaId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* fetchCityAll(actions) {
  const response = yield call(fetchCity, actions.CityId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}
export function* fetchUserByIdAll(actions) {
  const response = yield call(fetchUserById, actions.UserId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}
export function* fetchBranchAll(actions) {
  const response = yield call(fetchBranch, actions.CompanyId, actions.BranchId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}
export function* fetchUserRoleAll(actions) {
  const response = yield call(fetchUserRole, actions.UserRoleId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}
export function* fetchDepartmentsAll(actions) {
  const response = yield call(fetchDepartments, actions.DepartmentsId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}
export function* fetchVendorAll(actions) {
  const response = yield call(fetchVendor, actions.VendorId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}
export function* fetchCompanyAll(actions) {
  const response = yield call(fetchCompany, actions.CompanyId);
  if (response) {
    actions.promise.resolve(response.data);
  }
}

export function* fetchDashDatesSaga(action) {
  try {
    const response = yield call( action.dashboardDates);
    if (response) {
      yield put({ type: FETCH_DASHBOARDDATES, dashboardDates: response.data });
    }
  } catch (error) {
    yield put({ type: FETCH_DASHBOARDDATES, error });
  }
}
// export function* onPropertyChangeEvent(actions) {
//   
//   yield put({ type: ON_PROPERTY_CHANGED, payload: actions.CompanyId });
//   //const response = yield call(onpropertychanged, actions.CompanyId);
//   //if (response) {
//     //actions.promise.resolve(response.data);
//   //}
// }

// export function* fetchDepartment(actions) {
//   try {
//     const response = yield call(fetch_deparment);
//     
//     if (response) {

//       if (actions.escode == "UpdateCategoryData") {
//         const navigationresponse = yield call(fetchESQuery, "Navigation", actions.param);
//         if (navigationresponse) {
//           yield put({ type: UPDATE_NAVIGATION, payload: navigationresponse.data });
//         }
//       }
//       else {
//         actions.promise.resolve(response.data);
//       }

//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }

// export function* fetchESQueries(actions) {
//   try {
//     const response = yield call(fetchESQuery, actions.escode, actions.param);
//     if (response) {

//        if (actions.escode == "UpdateCategoryData") {
//         const navigationresponse =yield call(fetchESQuery, "Navigation", actions.param);
//         if (navigationresponse) {
//           yield put({ type: UPDATE_NAVIGATION, payload: navigationresponse.data });
//         }
//       }
//       else {
//         actions.promise.resolve(response.data);
//       }

//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }

// export function* fetchCatalogStructure(actions) {
//   try {
//     const response = yield call(fetchStructure, actions.code);
//     if (response) {
//       actions.promise.resolve(response.data);
//       yield put({ type: UPDATE_STRUCTURE, payload: response.data });
//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }

// export function* fetchCatalogItems(actions) {
//   try {

//     const response = yield call(fetchItems, actions.itemcode, actions.tabname);
//     if (response) {
//       actions.promise.resolve(response.data);
//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }

// export function* fetchCurrencyData(actions) {
//   try {

//     const response = yield call(fetchCurrency);
//     if (response) {
//       actions.promise.resolve(response.data);
//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }

// export function* fetchCountryData(actions) {
//   try {

//     const response = yield call(fetchCountry);
//     if (response) {
//       actions.promise.resolve(response.data);
//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }

// export function* fetchCatalogMiniPrices(actions) {
//   try {

//     const response = yield call(fetchMiniPrices, actions.itemCodes);
//     if (response) {
//       actions.promise.resolve(response.data);
//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }

// export function* requestProductMissingInformation(actions) {
//   try {
//     const response = yield call(requestMissingInformation, actions.missInfo);
//     if (response) {
//       actions.promise.resolve(response.data)
//       //actions.promise.response(response.data)

//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }

// export function* fetchCatalogDocumentFiles(actions) {
//   try {
//     const response = yield call(fetchDocumentFiles, actions.fileName);
//     if (response) {
//       actions.promise.resolve(response.data)
//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }

// export function* requestproductMedia(actions) {
//   try {
//     const response = yield call(productMedia, actions.productId);
//     if (response) {
//       actions.promise.resolve(response.data)

//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }
// export function* requestproductDocument(actions) {
//   try {
//     const response = yield call(productDocument, actions.nodeId);
//     if (response) {
//       actions.promise.resolve(response.data)

//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }

// export function* insertErrorData(actions) {
//   try {
//     const response = yield call(insertError, actions.errorMessage);
//     if (response) {
//       actions.promise.resolve(response.data)
//       //actions.promise.response(response.data)

//     }
//   } catch (error) {
//     actions.promise.reject();
//   }
// }

export default function* rootSaga() {
  yield all([

    takeEvery(FETCH_DEPARTMENT, fetchDepartmentAll),
    takeEvery(SAVE_DEPARTMENT, saveDepartmentNew),
    takeEvery(DELETE_DEPARTMENT, deleteDepartmentItems),
    takeEvery(FETCH_USER, fetchUserAll),
    takeEvery(FETCH_PROPERTY_MEMBER, fetchPropertyMemberAll),
    takeEvery(SAVE_USER, saveUserNew),
    takeEvery(SAVE_CHANGEPASSWORD, saveChangePasswordNew),
    takeEvery(DELETE_USER, deleteUserItems),
    takeEvery(DELETE_PROPERTYMEMBER,deletePropertyOwnerItems),
    takeEvery(FETCH_USERTYPE, fetchUserTypeAll),
    takeEvery(FETCH_OWNERTYPE, fetchOwnerTypeAll),
    takeEvery(FETCH_RELATIONSHIPTYPE, fetchRelationshipTypeAll),
    takeEvery(FETCH_RESIDENTTYPE, fetchResidentTypeAll),
    takeEvery(FETCH_PROPERTYMEMBERBY_PROPERTYDETAILSID, fetchPropertyMemberByPropertyDetailsIDAll),
    takeEvery(FETCH_DOCUMENTTYPE, fetchDocumentTypeAll),
    takeEvery(FETCH_PROPERTY, fetchPropertyAll),
    takeEvery(FETCH_PROPERTYOWNER, fetchPropertyOwnerAll),
    takeEvery(FETCH_PROPERTYNAME, fetchPropertyNameAll),
    takeEvery(FETCH_CITY, fetchCityAll),
    takeEvery(FETCH_USERBYID, fetchUserByIdAll),
    takeEvery(FETCH_BRANCH, fetchBranchAll),
    takeEvery(FETCH_USERROLE, fetchUserRoleAll),
    takeEvery(FETCH_DEPARTMENTS, fetchDepartmentsAll),
    takeEvery(FETCH_VENDOR, fetchVendorAll),
    takeEvery(FETCH_COMPANY, fetchCompanyAll),
    //takeEvery(ON_PROPERTY_CHANGED, onPropertyChangeEvent),

  ]);
}