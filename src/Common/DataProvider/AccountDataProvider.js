import ServiceProvider from "../ServiceProvider.js";

// Sanjay, May 01 19
class   AccountDataProvider {
    GetAccountList(pagesize,pagenumber){
            let url = `Account/AccountList?PageSize=${pagesize}&PageNumber=${pagenumber}`;
            return new ServiceProvider().get(url);
    }
}
export default AccountDataProvider ;