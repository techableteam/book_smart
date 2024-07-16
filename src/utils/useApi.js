import axios from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Signup = async (userData) => {
  try {
    const response = await axios.post('/signup', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const Signin = async (credentials, endpoint) => {
  try {
    const response = await axios.post(`/${endpoint}/signin`, credentials);
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const isTokenInLocalStorage = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token !== null;
  } catch (error) {
    console.error('Error checking for token in localstorage:', error);
    return false;
  }
}