import {
    // UPDATE_STRUCTURE,
    // //  INIT,
    // UPDATE_CURRENT_STRUCTURE,
    // UPDATE_PRODUCTID_ID,
    // UPDATE_NAVIGATION,
    // UPDATE_STRUCTURE_DATA,
    // UPDATE_CURRENT_NODEID,
    // UPDATE_CURRENT_NODE,
    // UPDATE_STRUCTURE_ID,
    // UPDATE_CURRENCY,
    // UPDATE_ITEMCODEDATA,
    // UPDATE_CARDCOUNT,
    // UPDATE_COUNTRY,
    // GLOBAL_SEARCH,
    // UPDATE_SEARCH_TEXT,
    // UPDATE_DOCUMENT_CART,
    // HAS_ERROR
    FETCH_DEPARTMENT,
    FETCH_USER,
    FETCH_PROPERTY_MEMBER,
    FETCH_USERTYPE,
    FETCH_OWNERTYPE,
    FETCH_RELATIONSHIPTYPE,
    FETCH_RESIDENTTYPE,
    ON_PROPERTY_CHANGED,
    ON_USER_ROLE_CHANGED

} from './constants';
import { convertEsTojson } from '../../utility/common';

// const initialGLOBAL_SEARCHVal = {
//     indexkey: "",
//     languagecode: "",
//     productid: 0,
//     productcode: "",
//     productname: "",
//     basicdescription: "",
//     extdescription: "",
//     coretype: "",
//     structureid: 1,
//     nodeid: 0,
//     sname: "",
//     t: "",
//     l1: "",
//     l2: "",
//     l2id: "",
//     l3: "",
//     l3id: "",
//     l4: "",
//     l4id: "",
//     l5: "",
//     l5id: "",
//     l6: "",
//     l6id: "",
//     allproductitemcode: "",
//     allimages: "",
//     allspecification: "",
//     main_url: "",
//     thumb_url: "",
//     email: "",
//     produrl: ""

// };

const initStateObj =
{
    usreName: "",
    userEmail: "",
    userid: 0,
    companyid:0,
    puidn:0,
    entrolval:'User'
 
};

export default function commonreducer(state = initStateObj, action) {
    switch (action.type) {

        case FETCH_DEPARTMENT:
            {
                return {
                    ...state, productId: action.value
                }
            }
        case FETCH_USER:
        {
            return {
                ...state, userId: action.value
            }
        }
        case FETCH_PROPERTY_MEMBER:
        {
            return {
                ...state, userId: action.value
            }
        }
        case FETCH_USERTYPE:
        {
            return {
                ...state, userTypeId: action.value
            }
        }
        case FETCH_OWNERTYPE:
        {
            return {
                ...state, ownerTypeId: action.value
            }
        }
        case FETCH_RELATIONSHIPTYPE:
        {
            return {
                ...state, relationshipTypeId: action.value
            }
        }
        case FETCH_RESIDENTTYPE:
        {
            return {
                ...state, residentTypeId: action.value
            }
        }
        case ON_PROPERTY_CHANGED:
            {
                return {
                    ...state, puidn: action.CompanyId
                }
            }
            case ON_USER_ROLE_CHANGED:
                {
                    return {
                        ...state, entrolval: action.UserRole
                    }
                }
        // case UPDATE_STRUCTURE:
        //     {
        //         return {
        //             ...state, structureData: action.payload, currentStructure: action.payload != undefined ? convertEsTojson(action.payload)[0] : undefined
        //         }
        //     }
        // case UPDATE_STRUCTURE_ID:
        //     {
        //         return {
        //             ...state, structureId: action.value
        //         }
        //     }
        // case UPDATE_CURRENCY:
        //     {
        //         return {
        //             ...state, currency: action.value
        //         }
        //     }
        // case UPDATE_ITEMCODEDATA:
        //     {
        //         return {
        //             ...state, itemCodeData: action.value
        //         }
        //     }
        // case UPDATE_CARDCOUNT:
        //     {
        //         return {
        //             ...state, cardCount: action.value
        //         }
        //     }
        // case UPDATE_COUNTRY:
        //     {
        //         return {
        //             ...state, country: action.value
        //         }
        //     }

        // case UPDATE_SEARCH_TEXT:
        //     {
        //         return {
        //             ...state, searchText: action.value
        //         }
        //     }

        // case UPDATE_NAVIGATION:
        //     {
        //         return {
        //             ...state, navigationData: action.payload != undefined ? convertEsTojson(action.payload) : undefined
        //         }
        //     }
        // case UPDATE_STRUCTURE_DATA:
        //     {
        //         return {
        //             ...state, structureData: action.data, currentStructure: action.data != undefined ? convertEsTojson(action.data)[0] : undefined
        //         }
        //     }

        // case UPDATE_CURRENT_NODE:
        //     {
        //         return {
        //             ...state, currentNode: action.data
        //         }
        //     }
        // case UPDATE_CURRENT_NODEID:
        //     {
        //         return {
        //             ...state, currentNodeID: action.value
        //         }
        //     }
        // case GLOBAL_SEARCH:
        //     {
        //         return {
        //             ...state, globalSearch: action.data
        //         }
        //     }
        // case UPDATE_DOCUMENT_CART:
        //     {
        //         return {
        //             ...state, documentCart: action.documentData
        //         }
        //     }
        // case HAS_ERROR:
        //     {
        //         return {
        //             ...state, hasError: action.value
        //         }
        //     }
        default:
            return state;
    }
}