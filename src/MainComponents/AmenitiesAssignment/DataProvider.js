import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    managePropertyAmenities(model,type) {
        let url = '';
        switch (type) {
            case 'U':
                url = `Property/AmentiesAssignment/Save`;
                return srv.CallPostService(url, model[0]);

            case 'D':
                url = `Property/AmentiesAssignment/Delete/${model[0].propertyAmenitiesId}`
                return srv.CallPostService(url);

            case 'R':
                url = `Property/AmentiesAssignment`;
                return srv.CallPostService(url, model[0]);
       
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