import ApiService from '../../apiService';
import { getConfig } from '../../utility/apiConfig';


export async function fetchDepartment(SearchValue, PageSize, PageNumber) {
  const config = getConfig('common.fetchdepartment');
  config.pathVariables = { SearchValue: SearchValue, PageSize: PageSize, PageNumber: PageNumber }
  //config.pathVariables = { escode }
  // if (param != undefined)
  //   config.urlParams = { param }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function saveDepartment(data) {
  const config = getConfig('common.saveDepartment');
  config.data = data
  //config.pathVariables = { escode }
  // if (param != undefined)
  //   config.urlParams = { param }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function deleteDepartment(DepartmentId) {
  const config = getConfig('common.deleteDepartment');
  //config.data = data
  config.pathVariables = { DepartmentId }
  // if (param != undefined)
  //   config.urlParams = { param }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function fetchUser(SearchValue, PageSize, PageNumber) {
  const config = getConfig('common.fetchUser');
  config.pathVariables = { SearchValue: SearchValue, PageSize: PageSize, PageNumber: PageNumber }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

// 2021/04/23 Added PropertyId  RG
export async function fetchPropertyMember(PropertyId, PropertyMemberType, SearchValue, PageSize, PageNumber) {
  const config = getConfig('common.fetchPropertyMember');
  config.pathVariables = { PropertyId: PropertyId, PropertyMemberType: PropertyMemberType, SearchValue: SearchValue, PageSize: PageSize, PageNumber: PageNumber }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function saveUser(data) {
  const config = getConfig('common.saveUser');
  config.data = data
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function saveChangePassword(data) {
  const config = getConfig('common.saveChangePassword');
  config.data = data
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function deleteUser(UserId) {
  const config = getConfig('common.deleteUser');
  config.pathVariables = { UserId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function deletePropertyMemberOwner(PropertyMemberId) {
  const config = getConfig('common.deletePropertyMemberOwner');
  config.pathVariables = { PropertyMemberId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function fetchUserType(UserTypeId) {
  const config = getConfig('common.fetchUserType');
  config.pathVariables = { UserTypeId: UserTypeId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function fetchOwnerType(OwnerTypeId) {
  const config = getConfig('common.fetchOwnerType');
  config.pathVariables = { OwnerTypeId: OwnerTypeId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function fetchRelationshipType(RelationshipTypeId) {
  const config = getConfig('common.fetchRelationshipType');
  config.pathVariables = { RelationshipTypeId: RelationshipTypeId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function fetchResidentType(ResidentTypeId) {
  const config = getConfig('common.fetchResidentType');
  config.pathVariables = { ResidentTypeId: ResidentTypeId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function fetchPropertyMemberByPropertyDetailsID(PropertyDetailsId, IsOwner) {
  const config = getConfig('common.fetchPropertyMemberByPropertyDetailsID');
  config.pathVariables = { PropertyDetailsId: PropertyDetailsId, IsOwner: IsOwner }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function fetchDocumentType(DocumentTypeId) {
  const config = getConfig('common.fetchDocumentType');
  config.pathVariables = { DocumentTypeId: DocumentTypeId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function fetchProperty(PropertyId) {
  const config = getConfig('common.fetchProperty');
  config.pathVariables = { PropertyId: PropertyId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function fetchPropertyOwner(ParentMemberId) {
  const config = getConfig('common.fetchPropertyOwner');
  config.pathVariables = { ParentMemberId: ParentMemberId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function fetchPropertyName(ParkingAreaId) {
  const config = getConfig('common.fetchPropertyName');
  config.pathVariables = { ParkingAreaId: ParkingAreaId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}

export async function fetchCity(CityId) {
  const config = getConfig('common.fetchCity');
  config.pathVariables = { CityId: CityId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}
export async function fetchUserById(UserId) {
  const config = getConfig('common.fetchUserById');
  config.pathVariables = { UserId: UserId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}
export async function fetchBranch(CompanyId, BranchId) {
  const config = getConfig('common.fetchBranch');
  config.pathVariables = { CompanyId: CompanyId, BranchId: BranchId };
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}
export async function fetchUserRole(UserRoleId) {
  const config = getConfig('common.fetchUserRole');
  config.pathVariables = { UserRoleId: UserRoleId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}
export async function fetchDepartments(DepartmentsId) {
  const config = getConfig('common.fetchDepartments');
  config.pathVariables = { DepartmentsId: DepartmentsId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}
export async function fetchVendor(VendorId) {
  const config = getConfig('common.fetchVendor');
  config.pathVariables = { VendorId: VendorId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}
export async function fetchCompany(CompanyId) {
  const config = getConfig('common.fetchCompany');
  config.pathVariables = { CompanyId: CompanyId }
  const apiInstance = new ApiService(config);
  return apiInstance.call();
}


// export async function fetchESQueryWithData(escode, param) {
//   const config = getConfig('catalog.fetchEsQuery');
//   config.pathVariables = { escode }
//   if (param != undefined)
//     config.urlParams = { param }
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }



// export async function fetchESQuery(escode, param) {
//   const config = getConfig('catalog.fetchEsQuery');
//   config.pathVariables = { escode }
//   if (param != undefined)
//     config.urlParams = { param }
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }

// export async function fetchStructure(code) {
//   const config = getConfig('catalog.fetchStructures');
//   config.pathVariables = { code }
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }

// export async function fetchItems(itemcode, tabname) {
//   const config = getConfig('catalog.fetchItems');
//   config.pathVariables = { itemcode, tabname }
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }

// export async function fetchCurrency() {
//   const config = getConfig('catalog.fetchCurrency');
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }

// export async function fetchCountry() {
//   const config = getConfig('catalog.fetchCountry');
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }

// export async function fetchMiniPrices(itemCodes, domains) {
//   const config = getConfig('catalog.fetchMiniPrices');
//   config.pathVariables = { itemCodes, domains }
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }

// export async function requestMissingInformation(missInfo) {
//   const config = getConfig('catalog.requestMissingInformation');
//   config.data = missInfo
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }

// export async function fetchDocumentFiles(fileName) {
//   const config = getConfig('catalog.fetchDocumentFiles');
//   config.data = fileName
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }


// export async function productMedia(productId) {
//   const config = getConfig('catalog.productMedia');
//   config.pathVariables = { productId }
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }
// export async function productDocument(nodeId) {
//   const config = getConfig('catalog.productDocument');
//   config.pathVariables = { nodeId }
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }

// export async function insertError(errorMessage) {
//   const config = getConfig('catalog.insertError');
//   config.pathVariables = { errorMessage }
//   const apiInstance = new ApiService(config);
//   return apiInstance.call();
// }
