import axios from 'axios';

const instance = axios.create({
   baseURL: 'http://18.222.27.220:5000/',
   
  headers: {
    'Content-Type': 'application/json'
  },
})

export default instance;