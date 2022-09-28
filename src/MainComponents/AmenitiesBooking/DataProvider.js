import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    managePropertyAmenities(model,type) {
        let url = '';
        switch (type) {
            case 'U':
                url = `AmenitiesBookingApprove?Id=${model[0].Id}`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'D':
                url = `Property/AmentiesAssignment/Delete/${model[0].propertyAmenitiesId}`
                return srv.CallPostService(url);
                break;
            case 'R':
                url = `Property/AmentiesAssignment`;
                return srv.CallPostService(url, model[0]);
                break;       
            default:
        }
    }
    getPropertyFlat(model) {
        let url = `Property/PropertyFlat`
        return srv.CallPostService(url, model[0]);
    }
    saveAmenity(formdata) {
        let url = '';
        url = `Property/AmentiesAssignment/Save`;
        return srv.CallPostFormData(url, formdata);
   }
    
}
export default DataProvider;