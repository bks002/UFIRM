import ServiceProvider from '../../Common/ServiceProvider.js';
import { promiseWrapper } from '../../utility/common';
let srv = new ServiceProvider();
class DataProvider {
    managePropertyMember(model, type) {
        let url = '';
        switch (type) {
            case 'U':
                url = `Property/PropertyMember/Save`;
                return srv.CallPostFormData(url, model);
                break;
            case 'I':
                url = `Property/ViewPersonalInformation/Save`
                return srv.CallPostService(url, model[0]);
                break;
            case 'R':
                url = `Property/PropertyMember/ListAll/${model[0].PropertyId}/${model[0].PropertyMemberType}/${model[0].SearchValue}/${model[0].PageSize}/${model[0].PageNumber}`;
                return srv.CallGetService(url);
                break;
            case 'M':
                url = `Property/PropertyMemberByPropertyDetailsID/${model[0].PropertyDetailsId}/${model[0].IsOwner}`;
                return srv.CallGetService(url);
                break;
            case 'O':
                url = `Property/PropertyMemberByPropertyDetailsID/${model[0].PropertyDetailsId}/${model[0].IsOwner}`;
                return srv.CallGetService(url);
                break;
            default:
        }
    }
    savePropertyMember(formdata) {
        let url = '';
        url = `Property/PropertyMember/Save`;
        return srv.CallPostFormData(url, formdata);
    }
}
export default DataProvider;