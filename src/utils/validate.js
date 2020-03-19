import cookie from 'react-cookies';
import axios from 'axios' ;
import {CURRENT_USER_API} from './constants.js';

function validateCookie () {
    if(cookie.load('token')){
        const token = cookie.load('token');
        const headers = {
            'Authorization': 'Token '.concat(token)
          }
          axios.get(CURRENT_USER_API,{headers : headers})
          .then(res => {
            return true;
          })
          .catch(function (error) {
            cookie.remove('token', { path: '/' });
            document.location.replace("/");
            return false;
          });
    }else{
        document.location.replace("/");
        return false;
    }
}
export default validateCookie;
