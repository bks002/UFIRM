import ServiceProvider from "../ServiceProvider.js";
let srv = new ServiceProvider();
class CommonDataProvider {



  //saveFacilityMember(formData) {
  //  //const ss = new FormData(formData);
  //      let url = `Facility/FacilityMember/Save`
  //      let data = srv.CallPostServiceMy(url, formData)
  //      return data;
  //}

  getCityMaster(cityid) {
    let url = `Master/City/${cityid}`
    return new ServiceProvider().get(url);
  }

  async getPropertyMasterAsync(propertyId) {
    let url = `Property/PropertyMaster/${propertyId}`
    let data = await srv.CallSynchronouse(url)
    return data;
  }

  // async getPropertyMaster(propertyId) {
  //     let url = `Property/PropertyMaster/${propertyId}`
  //    //return Promise.all([new ServiceProvider().getsynchronouse(url)]);
  //    var result ='async';
  //    new ServiceProvider().getData(url).then(res=>{
  //        
  //     return res;
  //    });
  //    return result;
  //    // return  Promise.all(new ServiceProvider().getsynchronouse(url));
  // }
  getPropertyMaster(propertyId) {
    let url = `Property/PropertyMaster/${propertyId}`
    return new ServiceProvider().get(url);
  }
  getAmenitiesMaster(amenityId) {
    let url = `Master/AmenitiesMaster/${amenityId}`
    return new ServiceProvider().get(url);
  }
  getPropertyTowers(propertyId) {
    let url = `Property/PropertyTower/${propertyId}`
    return new ServiceProvider().get(url);
  }
  getPropertyFlat(towerId) {
    let url = `Property/PropertyFlat/${towerId}`
    return new ServiceProvider().get(url);
  }

  getDocumentType(DocumentTypeId) {
    let url = `Master/DocumentType/${DocumentTypeId}`
    return new ServiceProvider().get(url);
  }

  async getPropertyTowersAsync(propertyId) {
    let url = `Property/GetPropertyTowers/${propertyId}`
    let data = await srv.CallSynchronouse(url)
    return data;

  }



  getParkingZone(propertyId) {
    let url = `Property/ParkingZone/${propertyId}`
    return Promise.all([new ServiceProvider().getsynchronouse(url)]);
    //return  Promise.all(new ServiceProvider().getsynchronouse(url));
  }
  //  getParkingZone(propertyId) {
  //     let url = `Property/ParkingZone/${propertyId}`
  //     return Promise.all([new ServiceProvider().getsynchronouse(url)]);
  //    //return  Promise.all(new ServiceProvider().getsynchronouse(url));
  // }

  async getParkingZoneAsync(propertyId) {
    let url = `Property/ParkingZone/${propertyId}`
    let data = await srv.CallSynchronouse(url)
    return data;
  }

  async getPropertyDetasilsAsync(propertyId) {
    let url = `Property/GetPropertyDetails/${propertyId}`
    let data = await srv.CallSynchronouse(url)
    return data;
  }

  async getParkingDetailsAsync(ParkingzoneId) {
    let url = `Property/GetParkingDetails/${ParkingzoneId}`
    let data = await srv.CallSynchronouse(url)
    return data;
  }

  getRelationshipType(RelationshipTypeId) {
    let url = `Property/RelationshipType/${RelationshipTypeId}`
    return new ServiceProvider().get(url);
  }

  getResidentType(ResidentTypeId) {
    let url = `Property/ResidentType/${ResidentTypeId}`
    return new ServiceProvider().get(url);
  }

  getPropertyMember(ParentMemberId) {
    let url = `Property/PropertyOwner/${ParentMemberId}`
    return new ServiceProvider().get(url);
  }
  getOwnershipType(OwnerTypeId) {
    let url = `Property/OwnerType/${OwnerTypeId}`
    return new ServiceProvider().get(url);
  }
  async getMeasureunite() {
    let url = `Property/GetMeasureunit`
    let data = await srv.CallSynchronouse(url)
    return data;
  }
  async getPropertyDetailType() {
    let url = `Property/GetPropertyDetailType`
    let data = await srv.CallSynchronouse(url)
    return data;
  }


  getFacilityType() {
    let url = `Facility/FacilityType`
    return new ServiceProvider().get(url);
  }
  getFacilityMaster(FacilityTypeId) {
    let url = `Facility/FacilityMaster/${FacilityTypeId}`
    return new ServiceProvider().get(url);
  }

}
export default CommonDataProvider;