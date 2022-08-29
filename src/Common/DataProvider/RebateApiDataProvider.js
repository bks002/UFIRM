import ServiceProvider from "../ServiceProvider.js"
import { debug } from "util";
let srv = new ServiceProvider();
class RebateApiDataProvider {
  getRebateAccDetails(inputParam) {
    let url = `Rebate/RebateDetails?UserId=${inputParam[0].UserId}&FilterType=${inputParam[0].FilterType}&SearchValue=${inputParam[0].SearchValue}&PageSize=${inputParam[0].PageSize}&PageNumber=${inputParam[0].PageNumber}`;
    let data = new srv.get(url)
    return data;
  }

  manageRebateAcc(datamodel, type) {
    let url = '';
    if (type == 'C') {
      url = `Rebate/SaveRebateAccount`;
    } else if (type == 'U') {
      url = `Rebate/EditRebateAccount`;
    }
    return srv.CallPostService(url, datamodel[0]);
  }

  getRebateAccById(rebateAccountId) {
    let url = `Rebate/RebateAccountByRebateAccountId?RebateAccountId=${rebateAccountId}`;
    let data = new srv.get(url);
    return data;
  }

  getRebateScale(rebateAccountId) {
    let url = `Rebate/RebateScale?RebateAccountId=${rebateAccountId}`;
    let data = new srv.get(url);
    return data;
  }

  getRebatePayOut(rebateAccountId) {
    let url = `Rebate/RebatePayoutDetails?RebateAccountId=${rebateAccountId}`;
    let data = new srv.get(url);
    return data;
  }

  updateRebatePayOut(rebateAccountId,userId,rebatePayoutData) {
    let url = `Rebate/RebatePayoutManagement?RebateAccountId=${rebateAccountId}&UserId=${userId}&RebatePayoutData=${rebatePayoutData}`;
    let data =  srv.CallPostAsyncService(url);
    return data;
  }

  getItemConfigQuery(rebateAccountId) {
    let url = `Rebate/RebateItemConfigQuery?RebateAccountId=${rebateAccountId}`;
    let data = new srv.get(url);
    return data;
  }

  async deleteRebateScale(scaleId, userId) {
    let url = `Rebate/DeleteScale?ScaleId=${scaleId}&UserId=${userId}`;
    let data = await srv.CallPostAsyncService(url);
    return data;
  }

  async chekDuplicateRecords(param) {
    let url = `Rebate/CheckDuplicateRebateAccountRecords?AccountId=${param.AccountId}&PaymentAccountId=${param.PaymentAccountId}&StartDate=${param.StartDate}&EndDate=${param.EndDate}&ItemQuery=${param.ItemsQuery}&RebateAccountId=${param.RebateAccountId}`;
    let data = await srv.CallSynchronouse(url)
    return data;
  }

  CreateAuditLog(action, userid, rebateAccountId) {

    let datamodule = [{ RebateAccountId: rebateAccountId, UserId: userid, Action: action }];
    let url = `Rebate/SaveRebateAuditLog`;
    return new srv.CallPostService(url, datamodule[0]);
  }

  //Sanjay:Jul 5 2019
  deactivateRebateAccount(rebateIdCollection, userId) {
    let url = `Rebate/DeactivateRebateAccount?RebateAccountCollection=${rebateIdCollection}&UserId=${userId}`;
    let data = new srv.CallPostService(url);
    return data;
  }

  //Sukanya Jul 2 2019
  downloadRebateAccounts(UserId, FilterType, SearchValue, PageSize, PageNumber, Filetype) {
    let url = `Rebate/DownloadRebateAccountdetailsFileByUserId?UserId=${UserId}&FilterType=${FilterType}&SearchValue=${SearchValue}&PageSize=${PageSize}&PageNumber=${PageNumber}&Filetype=${Filetype}`;
    let data = srv.CallPostService(url);
    return data;
  }

  getRebateAuditlog(rebateAccountId) {
    let url = `Rebate/RebateAuditLog?RebateAccountId=${rebateAccountId}`;
    let data = new srv.get(url)
    return data;
  }

  //Sanjay:Jul 5 2019
  UpdateDenormalizationTable(rebateAccountId, actionType) {
    let url = `Rebate/PopulateDenormalizeTable?RebateAccountId=${rebateAccountId}&ActionType=${actionType}`;
    let data = new srv.CallPostService(url);
    return data;
  }


}

export default RebateApiDataProvider;