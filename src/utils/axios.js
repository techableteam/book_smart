import axios from 'axios';

// Use HTTPS in production. Google Play requires encryption in transit; HTTP will trigger "Invalid Encryption Declaration".
// When your API is served over HTTPS (e.g. https://api.booksmart.app), set baseURL to that URL and answer "Yes" to encryption in the Data safety form.
const baseURL = 'http://18.222.27.220:5000/';

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
})

export default instance;