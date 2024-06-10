import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageEscalationMatrixGroupMapped(model, type) {
        //
        let url = '';
        function manageEscalationMatrixGroupMapped(model, type) {
            let url = ''; // Initialize URL variable
            
            // Switch statement to handle different types of operations
            switch (type) {
                case 'C':
                    // If type is 'C' (Create), construct the URL for creating a new entry
                    url = `Property/EscalationMatrixGroupMappUsers/Save`;
                    // Make a POST request to save the data
                    return srv.CallPostService(url, model[0]);
                case 'U':
                    // If type is 'U' (Update), construct the URL for updating an existing entry
                    url = `Property/EscalationMatrixGroupMappUsers/Save`;
                    // Make a POST request to save the updated data
                    return srv.CallPostService(url, model[0]);
                case 'D':
                    // If type is 'D' (Delete), construct the URL for deleting an entry
                    url = `Property/EscalationMatrixGroupMappUsers/Delete/${model[0].EscalationMatrixGroupId}/${type}`;
                    // Make a POST request to delete the entry
                    return srv.CallPostService(url);
                case 'R':
                    // If type is 'R' (Retrieve), construct the URL for retrieving mappings
                    url = `Property/EscalationMatrixGroupUsers/ListAll/${model[0].PropertyId}/${model[0].SearchValue}/${model[0].PageSize}/${model[0].PageNumber}/${type}`;
                    // Make a GET request to retrieve the mappings
                    return srv.get(url);
                case 'T':
                    // If type is 'T' (List All), construct the URL for listing all mappings
                    url = `Property/EscalationMatrixGroupUsers/ListAll/${model[0].PropertyId}/${model[0].SearchValue}/${model[0].PageSize}/${model[0].PageNumber}/R`;
                    // Make a GET request to list all mappings
                    return srv.get(url);
                default:
                    // If type is not recognized, do nothing
                    break;
            }
        }
        
        // switch (type) {
        //     case 'C':
        //         url = `Property/EscalationMatrixGroupMappUsers/Save`;
        //         return srv.CallPostService(url, model[0]);
        //     case 'U':
        //         url = `Property/EscalationMatrixGroupMappUsers/Save`;
        //         return srv.CallPostService(url, model[0]);
        //     case 'D':
        //         url = `Property/EscalationMatrixGroupMappUsers/Delete/${model[0].EscalationMatrixGroupId}/${type} `
        //         return srv.CallPostService(url);
        //     case 'R':
        //         url = 'Property/EscalationMatrixGroupUsers/ListAll/ '
        //             + model[0].PropertyId + '/' + model[0].SearchValue + '/' + model[0].PageSize + '/'
        //             + model[0].PageNumber + '/' + type
        //         return srv.get(url);
        //     case 'T':
        //         url = 'Property/EscalationMatrixGroupUsers/ListAll/ '
        //             + model[0].PropertyId + '/' + model[0].SearchValue + '/' + model[0].PageSize + '/'
        //             + model[0].PageNumber + '/' + 'R'
        //         return srv.get(url);
        //     default:
        // }
    }

    getUsers(PropertyID) {
        let url = `Property/Users/${PropertyID}`
        return srv.get(url);
    }

}
export default DataProvider;