import ServiceProvider from "../ServiceProvider.js";

class   DisplayPriceDataProvider {
    getproductprice(account, currency, itemcode, validate) {

        let url = `Pricing/Price?AccountNumber=${account}&ItemNumber=${itemcode}&CurrencyCode=${currency}&ValidDate=${validate}`
        return new ServiceProvider().get(url);

    }
}
 
export default DisplayPriceDataProvider;