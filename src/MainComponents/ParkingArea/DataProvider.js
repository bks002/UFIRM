import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    // getMasterData() {
    //     return new srv.get('Discount/MasterData')
    // }
    // async chekDuplicateRecords(param) {
    //     let url = `Discount/CheckDuplicateRecords?AccountId=${param.AccountId}&StartDate=${param.StartDate}&EndDate=${param.EndDate}&ItemQuery=${param.ItemsQuery}&DiscountProfileId=${param.DiscountProfileId}&ScaleTypeId=${param.ScaleTypeId}&DiscountTypeId=${param.DiscountTypeId}`;
    //     let data = await srv.CallSynchronouse(url)
    //     return data;
    // }

    // manageDiscountProfile(datamodel, type) {
    //     let url = '';
    //     if (type == 'C') {
    //         url = `Discount/SaveDiscountProfile`;
    //     } else if (type == 'U') {
    //         url = `Discount/UpdateDiscountProfile`;
    //     }
    //     return srv.CallPostService(url, datamodel[0]);
    // }
    // CreateAuditLog(action, userid, discountId) {
    //     let datamodule = [{ DiscountProfileId: discountId, UserId: userid, Action: action }];
    //     let url = `Discount/SaveAuditLog`;
    //     return new srv.CallPostService(url, datamodule[0]);
    // }// Sanjay- Aug-23 2019
    // getDiscountScaleData(discountProfileId) {
    //     //alert(`Discount/ScaleDetails?DiscountProfileId=${discountProfileId}`);
    //     return new srv.get(`Discount/ScaleDetails?DiscountProfileId=${discountProfileId}`);
    // }//end



    // // Sanjay- Sep-03 2019
    // DeactivateDiscount(discountIds,userId,justification) {
    //     return new srv.PostUsingURL(`Discount/DeactivateDiscountProfile?discountProfileIds=${discountIds}&userId=${userId}&justification=${justification}`);
    // }//end
    // //sukanya Sep-03-2019
    // downloadDiscountProfile(Param,FileType)
    // {
    //     let  url =`Discount/DownloadDiscountProfile?UserId=${Param[0].UserId}&FilterType=${Param[0].FilterType}&SearchValue=${Param[0].SearchValue}&PageSize=${Param[0].PageSize}&PageNumber=${Param[0].PageNumber}&Filetype=${FileType}`;
    // return srv.CallPostService(url);
    // }
    // getDiscountAuditlog(discountProfileId) {
    //     let url = `Discount/AuditLogDetails?DiscountProfileId=${discountProfileId}`;
    //     let data = new srv.get(url)
    //     return data;
    // }
    // // //Rohan
    // // getDiscountPackFactor(discountItemCode,discountUomTypeId) {
    // //     let url = `Discount/ItemUnitFactors?ItemCode=${discountItemCode}-EU&UOMTypeId=${discountUomTypeId}`;
    // //     let data = new srv.get(url)
    // //     return data;
    // // }
    // getproductitemprice(reqjson) {
    //     // let url = `Discount/ProductPriceDetails?RequestJson=${reqjson}`
    //     let url = `Pricing/CustomerPrice?RequestJson=${reqjson}`
    //     return new srv.get(url);

    // }
    // populateDenormTable(IdsCollection,ActionType)
    // {
    //     return new srv.CallPostService(`Discount/PopulateDenormalizeTable?IdsCollection=${IdsCollection}&ActionType=${ActionType}`);
    // }

    //  // Sanjay- Aug-26 2019
    //  getDiscountHomeData(param,removeCommas=false)
    //  {
    //      return new srv.get(`Discount/DiscountProfile?UserId=${param[0].UserId}&FilterType=${param[0].FilterType}&SearchValue=${param[0].SearchValue}&PageSize=${param[0].PageSize}&PageNumber=${param[0].PageNumber}&removeCommas=${removeCommas}`);
    //  }//end

    manageParkingArea(model) {
        let url = '';
        url = `Property/ManageParkingZone`;
        return srv.CallPostService(url, model[0]);
    }

}
export default DataProvider;