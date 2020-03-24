import cookie from 'react-cookies';
import axios from 'axios';
import { BE_CURRENT_USER_API_URL } from './constants.js';

function validateCookie() {
  if (cookie.load('token')) {
    const token = cookie.load('token');
    const headers = {
      'Authorization': 'Token '.concat(token)
    }
    axios.get(BE_CURRENT_USER_API_URL, { headers: headers })
      .then(res => {
        return true;
      })
      .catch(function (error) {
        cookie.remove('token', { path: '/' });
        document.location.replace("/");
        return false;
      });
  } else {
    document.location.replace("/");
    return false;
  }
}
export default validateCookie;
