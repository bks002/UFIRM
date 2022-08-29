import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageEscalationMatrixGroupMapped(model, type) {
        //
        let url = '';
        switch (type) {
            case 'C':
                url = `Property/EscalationMatrixGroupMappUsers/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'U':
                url = `Property/EscalationMatrixGroupMappUsers/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'D':
                url = `Property/EscalationMatrixGroupMappUsers/Delete/${model[0].EscalationMatrixGroupId}/${type} `
                return srv.CallPostService(url);
                break;
            case 'R':
                url = 'Property/EscalationMatrixGroupUsers/ListAll/ '
                    + model[0].PropertyId + '/' + model[0].SearchValue + '/' + model[0].PageSize + '/'
                    + model[0].PageNumber + '/' + type
                return srv.get(url);
                break;
            case 'T':
                url = 'Property/EscalationMatrixGroupUsers/ListAll/ '
                    + model[0].PropertyId + '/' + model[0].SearchValue + '/' + model[0].PageSize + '/'
                    + model[0].PageNumber + '/' + 'R'
                return srv.get(url);
                break;
            default:
        }
    }

    getUsers(PropertyID) {
        let url = `Property/Users/${PropertyID}`
        return srv.get(url);
    }

}
export default DataProvider;