import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    //debugger
    manageFacilityMember(model, type) {
        let url = '';
        switch (type) {
            case 'C':
                //url = `Facility/FacilityMember/Save`;
                //return srv.CallPostService(url, model[0]);
                url = `FacilityMemberSave`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'U':
                url = `FacilityMemberSave`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'D':
                url = `Facility/FacilityMember/Delete/${model[0].facilityMemberId}`
                return srv.CallPostService(url);
                break;
            case 'B':
                url = `Facility/FacilityMember/Block/${model[0].facilityMemberId}/${model[0].isBlocked}`
                return srv.CallPostService(url);
                break;
            case 'R':
                url = `Facility/FacilityMember`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'Upload':
                url = 'FacilityMemberKYCUpload';
                return srv.CallPostNewService(url, model[0]);
                break
                case 'DeleteFile':
                    url = 'FacilityMemberKYCRemove';
                    return srv.CallPostNewService(url, model[0]);
                    break
            default:
        }
    }
    saveFacilityMember(formdata) {
        let url = '';
        url = `Facility/FacilityMember/Save`;
        return srv.CallPostFormDataNew(url, formdata);
    }

}
export default DataProvider;