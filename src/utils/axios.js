import axios from 'axios';

const instance = axios.create({
  // baseURL: 'https://booksmart-backend-rcxk.onrender.com',
  // baseURL : 'https://scarcely-funky-gnu.ngrok-free.app',
  baseURL: 'http://16.171.170.177:5000/',
  // baseURL: 'http://178.63.104.183:5000',
  headers: {
    'Content-Type': 'application/json'
  },
})

export default instance;