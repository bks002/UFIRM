import {
    
    FETCH_DEPARTMENT,
    FETCH_USER,
    FETCH_PROPERTY_MEMBER,
    FETCH_USERTYPE,
    FETCH_OWNERTYPE,
    FETCH_RELATIONSHIPTYPE,
    FETCH_RESIDENTTYPE,
    ON_PROPERTY_CHANGED,
    ON_USER_ROLE_CHANGED,
    FETCH_DASHBOARDDATES

} from './constants';
import { convertEsTojson } from '../../utility/common';

const initStateObj =
{
    usreName: "",
    userEmail: "",
    userid: 0,
    companyid:0,
    puidn:0,
    entrolval:'User',
    dashDates:""
 
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
                case FETCH_DASHBOARDDATES:
                    {
                        return{
                            ...state, dashDates:action.dashboardDates
                        }
                    }
        default:
            return state;
    }
}