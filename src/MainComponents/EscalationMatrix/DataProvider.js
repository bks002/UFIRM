import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageEscalationMatrix(model, type) {
        let url = '';

        switch (type) {
            case 'C':
            case 'U':
                // If type is 'C' (Create) or 'U' (Update), construct the URL for saving
                url = `Property/EscalationMatrix/Save`;
                // Make a POST request to save the data
                return srv.CallPostService(url, model[0]);
            case 'D':
                // If type is 'D' (Delete), construct the URL for deleting
                url = `Property/EscalationMatrix/Delete/${model[0].EscalationMatrixId}/${type}`;
                // Make a POST request to delete the entry
                return srv.CallPostService(url);
            case 'R':
                // If type is 'R' (Retrieve), construct the URL for retrieving all
                url = 'Property/EscalationMatrix/ListAll/' +
                    model[0].SearchValue + '/' + model[0].PageSize + '/' +
                    model[0].PageNumber + '/' + type + '/' + model[0].PropertyId;
                // Make a GET request to retrieve all
                return srv.get(url);
            case 'T':
                // If type is 'T' (List All), construct the URL for listing all
                url = 'Property/EscalationMatrix/ListAll/' +
                    model[0].SearchValue + '/' + model[0].PageSize + '/' +
                    model[0].PageNumber + '/' + 'R' + '/' + model[0].PropertyId;
                // Make a GET request to list all
                return srv.get(url);
            case 'S':
                // If type is 'S' (Statement), construct the URL for retrieving assignments
                url = 'Property/EscalationMatrixAssignments/ListAll/' +
                    model[0].StatementType + '/' + model[0].EscalationMatrixId;
                // Make a GET request to retrieve assignments
                return srv.get(url);
            default:
                // If type is not recognized, do nothing
                break;
        }
        
        // switch (type) {
        //     case 'C':
        //         url = `Property/EscalationMatrix/Save`;
        //         return srv.CallPostService(url, model[0]);
        //     case 'U':
        //         url = `Property/EscalationMatrix/Save`;
        //         return srv.CallPostService(url, model[0]);
        //     case 'D':
        //         url = `Property/EscalationMatrix/Delete/${model[0].EscalationMatrixId}/${type} `
        //         return srv.CallPostService(url);
        //     case 'R':                
        //         url = 'Property/EscalationMatrix/ListAll/'
        //             + model[0].SearchValue + '/' + model[0].PageSize + '/'
        //             + model[0].PageNumber + '/' + type + '/' + model[0].PropertyId
        //         return srv.get(url);
        //     case 'T':
        //         url = 'Property/EscalationMatrix/ListAll/'
        //             + model[0].SearchValue + '/' + model[0].PageSize + '/'
        //             + model[0].PageNumber + '/' + 'R /' + model[0].PropertyId
        //         return srv.get(url);
        //     case 'S':
        //         url = 'Property/EscalationMatrixAssignments/ListAll/'
        //             + model[0].StatementType + '/' + model[0].EscalationMatrixId
        //         return srv.get(url);
        //     default:
        // }
    }

    getDropdownData(type, PropertyId) {
        let url = `Property/EscalationMatrixDropdown/${type}/${PropertyId}`
        return srv.get(url);
    }

}
export default DataProvider;