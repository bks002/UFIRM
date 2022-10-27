import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageKyc(model,type) {
        let url = '';
        switch (type) {
            case 'U':
                url = `KYCUpate`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'D':
                url = `Property/AmentiesAssignment/Delete/${model[0].propertyAmenitiesId}`
                return srv.CallPostService(url);
                break;
            case 'R':
                url = `KycDetailsList`;
                return srv.getComplaint(url);
                break; 
                case 'AP':
                    console.log(model);
                url = `KYCApprove?Id=${model[0].Id}`;
                return srv.CallPostNewService(url, model[0]);
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
    
   saveKYC(formdata) {
    let url = '';
    url = `KYCUpate`;
    console.log(url);
    return srv.CallPostFormDataNew(url, formdata);
}
}
export default DataProvider;