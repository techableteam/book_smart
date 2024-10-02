import axios from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const Signup = async (userData, endpoint) => {
  try {
    console.log('success')
    const response = await axios.post(`api/${endpoint}/signup`, userData);
    return response.data;
  } catch (error) {
    return {error: error};
  }
};

export const Signin = async (credentials, endpoint) => {
  try {
    const response = await axios.post(`api/${endpoint}/login`, credentials);
    console.log(response.data);
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    return {error: error};
  }
}

export const getAllFacility = async (userData, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/getAllFacilities`, userData, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.log(error);
    return {error: error};
  }
}

export const ForgotPassword = async (credentials, endpoint) => {
  try {
    console.log("login");
    const response = await axios.post(`api/${endpoint}/forgotPassword`, credentials);
    return response.data;
  } catch (error) {
    console.error(error)    
    return {error: error.response.data.message};
  }
}

export const PhoneSms = async (credentials, endpoint) => {
  try {
    console.log("login");
    const response = await axios.post(`api/${endpoint}/phoneSms`, credentials);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(error)    
    return {error: error.response.data.message};
  }
}

export const VerifyCodeSend = async (credentials, endpoint) => {
  try {
    console.log("login", credentials);
    const response = await axios.post(`api/${endpoint}/verifyCode`, credentials);
    console.log(response);
    // if (response.data.verifyCode) {
    //   await AsyncStorage.setItem('token', response.data.verifyCode);
    // }
    return response.data;
  } catch (error) {
    console.error(error)    
    return {error: error.response.data.message};
  }
}

export const VerifyPhoneCodeSend = async (credentials, endpoint) => {
  try {
    const response = await axios.post(`api/${endpoint}/verifyPhone`, credentials);
    if (response.data.verifyCode) {
      await AsyncStorage.setItem('token', response.data.verifyCode);
    }
    return response.data;
  } catch (error) {
    return {error: error.response.data.message};
  }
}

export const getUserInfo = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/getUserInfo`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    return {error: error}
  }
};

export const getUserProfile = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/getUserProfile`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    return response.data;
  } catch (error) {
    return {error: error}
  }
};

export const updatePassword = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/updatePassword`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    return response.data;
  } catch (error) {
    return {error: error}
  }
};

export const ResetPassword = async (credentials, endpoint) => {
  try {
    const response = await axios.post(`api/${endpoint}/resetPassword`, credentials);
    return response.data;
  } catch (error) {
    console.error(error)    
    return {error: error.response.data.message};
  }
}

export const Update = async (updateData, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    console.log(existingToken);
    const response = await axios.post(`api/${endpoint}/update`, updateData, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    return {error: error}
  }
}

export const addDegreeItem = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/addItem`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    return response.data;
  } catch (error) {
    return {error: error}
  }
}

export const getDegreeList = async (endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.get(`api/${endpoint}/getList`, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    return response.data;
  } catch (error) {
    return {error: error}
  }
}

export const getFacilityInfo = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/getFacilityInfo`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    return response.data;
  } catch (error) {
    return {error: error}
  }
}

export const addLocationItem = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/addItem`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    return response.data;
  } catch (error) {
    return {error: error}
  }
}

export const getLocationList = async (endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.get(`api/${endpoint}/getList`, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    return response.data;
  } catch (error) {
    return {error: error}
  }
}

export const updateUserStatus = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/updateUserStatus`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    return response.data;
  } catch (error) {
    return {error: error}
  }
}

export const removeAccount = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/removeAccount`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    return response.data;
  } catch (error) {
    return {error: error}
  }
}

export const Updates = async (updateData, endpoint) => {
  try {
    console.log("update");
    // Existing token (obtained from AsyncStorage or login)
    const existingToken = await AsyncStorage.getItem('token');

    // Include token in Authorization header
    const response = await axios.post(`api/${endpoint}/update`, updateData, {
      headers: {
        Authorization: `Bearer ${existingToken}`,
        userRole: 'Admin'
      }
    });
    console.log('Success');
    

    // If the update is successful, you can potentially update the token in AsyncStorage
    if (response.status === 200) {
      // Optionally, if the backend sends a new token for some reason
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const UpdateUser = async (updateData, endpoint) => {
  try {
    console.log("update");
    // Existing token (obtained from AsyncStorage or login)
    const existingToken = await AsyncStorage.getItem('token');

    // Include token in Authorization header
    const response = await axios.post(`api/${endpoint}/updateUser`, updateData, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    // If the update is successful, you can potentially update the token in AsyncStorage
    if (response.status === 200) {
      // Optionally, if the backend sends a new token for some reason
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    console.log(response.data);
    
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const updateUserInfo = async (updateData, endpoint) => {
  try {
    console.log("update");
    // Existing token (obtained from AsyncStorage or login)
    const existingToken = await AsyncStorage.getItem('token');

    // Include token in Authorization header
    const response = await axios.post(`api/${endpoint}/updateUserInfo`, updateData, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    // If the update is successful, you can potentially update the token in AsyncStorage
    if (response.status === 200) {
      // Optionally, if the backend sends a new token for some reason
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } 
    console.log(response.data);
    
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const updateDocuments = async (updateData, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/updateDocuments`, updateData, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    }
    return response.data;
  } catch (error) {
    return { error: error };
  }
}

export const PostJob = async (jobData, endpoint) => {
  try {
    const response = await axios.post(`api/${endpoint}/postJob`, jobData);
    return response.data;
  } catch (error) {
    return { error: error };
  }
};

export const getFacility = async (endpoint, role) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.get(`api/${endpoint}/facility`, {
      headers: {
        Authorization: `Bearer ${existingToken}`,
        Role: role
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } else if (response.status === 401) {
      console.log('Token is expired');
    }
    return response.data.jobData;
  } catch (error) {
    return { error: error };
  }
};

export const getBidIDs = async () => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.get(`api/admin/getBidIDs`, {
      headers: {
        Authorization: `Bearer ${existingToken}`,
      }
    });

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data.bidList;
  } catch (error) {
    return { error: error };
  }
};

export const getAllUsersName = async () => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.get(`api/admin/getAllUsersName`, {
      headers: {
        Authorization: `Bearer ${existingToken}`,
      }
    });

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data.userList;
  } catch (error) {
    return { error: error };
  }
};

export const getCaregiverTimesheets = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/getCaregiverTimesheets`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    return { error: error };
  }
};

export const getAllUsersList = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/getAllUsersList`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    return { error: error };
  }
};

export const allCaregivers = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/allCaregivers`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    return { error: error };
  }
};

export const getUserImage = async (data, endpoint) => {
  try {
    const response = await axios.post(`api/${endpoint}/getUserImage`, data);
    return response.data.data;
  } catch (error) {
    return { error: error };
  }
};

export const getAdminInfo = async (data) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/admin/getAdminInfo`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.log(JSON.stringify(error));
    return { error: error };
  }
};

export const Jobs = async (data, endpoint, role) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/shifts`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`,
        Role: role
      }
    });

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.log(JSON.stringify(error));
    return { error: error };
  }
};

export const Job = async (jobData, endpoint) => {
  try {
    const response = await axios.post(`api/${endpoint}/getJob`, jobData);
    return response.data;
  } catch (error) {
    console.log(JSON.stringify(error));
    return { error: error };
  }
};

export const removeJob = async (jobData, endpoint) => {
  try {
    const response = await axios.post(`api/${endpoint}/removeJob`, jobData);
    return response.data;
  } catch (error) {
    return { error: error };
  }
};

export const updateHoursStatus = async (jobData, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/updateHoursStatus`, jobData, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });
    // If the update is successful, you can potentially update the token in AsyncStorage
    if (response.status === 200) {
      // Optionally, if the backend sends a new token for some reason
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } else if (response.status === 401) {
      console.log('Token is expired')
      // navigation.navigate('Home')
    }
    return response.data;
  } catch (error) {
    return { error: error };
  }
};

export const setAwarded = async (jobData, endpoint) => {
  try {
    const response = await axios.post(`api/${endpoint}/setAwarded`, jobData);
    return response.data;
  } catch (error) {
    return { error: error };
  }
};

export const updateJobRatings = async (jobData, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/updateJobRatings`, jobData, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });
    // If the update is successful, you can potentially update the token in AsyncStorage
    if (response.status === 200) {
      // Optionally, if the backend sends a new token for some reason
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } else if (response.status === 401) {
      console.log('Token is expired')
      // navigation.navigate('Home')
    }
    return response.data;
  } catch (error) {
    return { error: error };
  }
};

export const updateJobTSVerify = async (jobData, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/updateJobTSVerify`, jobData, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });
    // If the update is successful, you can potentially update the token in AsyncStorage
    if (response.status === 200) {
      // Optionally, if the backend sends a new token for some reason
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } else if (response.status === 401) {
      console.log('Token is expired')
      // navigation.navigate('Home')
    }
    return response.data;
  } catch (error) {
    return { error: error };
  }
};

export const updateTimeSheet = async (data, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/updateTimeSheet`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });
    // If the update is successful, you can potentially update the token in AsyncStorage
    if (response.status === 200) {
      // Optionally, if the backend sends a new token for some reason
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } else if (response.status === 401) {
      console.log('Token is expired')
      // navigation.navigate('Home')
    }
    return response.data;
  } catch (error) {
    return { error: error };
  }
};

export const getClientInfoWithJobId = async (data, endpoint) => {
  try {
    const response = await axios.post(`api/${endpoint}/getClientInfo`, data);
    return response.data.userData;
  } catch (error) {
    return { error: error };
  }
};

export const getTimesheet = async (data) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/jobs/getTimesheet`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } else if (response.status === 401) {
      console.log('Token is expired');
    }
    return response.data.data;
  } catch (error) {
    return { error: error };
  }
};

export const MyShift = async (endpoint, role) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.get(`api/${endpoint}/myShift`, {
      headers: {
        Authorization: `Bearer ${existingToken}`,
        Role: role
      }
    });

    if (response.status === 200) {
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } else if (response.status === 401) {
      console.log('Token is expired')
    }
    return response.data.jobData;
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

export const UpdateTime = async (data, endpoint) => {
  try {
    console.log('success')
    // Existing token (obtained from AsyncStorage or login)
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/updateTime`, data, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });
    // const response = await axios.get("/test");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}


export const GetDashboardData = async (endpoint, role) => {
  try {
    // console.log("jobs");
    // Existing token (obtained from AsyncStorage or login)
    const existingToken = await AsyncStorage.getItem('token');
    console.log(existingToken)
    // Include token in Authorization header
    const response = await axios.get(`api/${endpoint}/getDashboardData`, {
      headers: {
        Authorization: `Bearer ${existingToken}`,
        Role: role
      }
    });
    // If the update is successful, you can potentially update the token in AsyncStorage
    if (response.status === 200) {
      // Optionally, if the backend sends a new token for some reason
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } else if (response.status === 401) {
      console.log('Token is expired')
      // navigation.navigate('Home')
    }
    return response.data.jobData;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const PostBid = async (bidData, endpoint) => {
  try {
    console.log('success')
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(`api/${endpoint}/postBid`, bidData, {
      headers: {
        Authorization: `Bearer ${existingToken}`
      }
    });
    return response.data;
  } catch (error) {
    return {error: error};
  }
};

export const isTokenInLocalStorage = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token !== null;

  } catch (error) {
    console.error('Error checking for token in localstorage:', error);
    return false;
  }
}

const failedAlert = (msg) => {
  Alert.alert(
    "SignIn failed",
    "",
    [
      {
        text: msg,
        onPress: () => {
          console.log('OK pressed')
        },
      },
    ],
    { cancelable: false }
  )
}

export const Clinician = async (endpoint, role) => {
  try {
    // console.log("jobs");
    // Existing token (obtained from AsyncStorage or login)
    const existingToken = await AsyncStorage.getItem('token');
    console.log(existingToken)
    // Include token in Authorization header
    const response = await axios.get(`api/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${existingToken}`,
        Role: role
      }
    });
    console.log(response.data.jobData)
    // If the update is successful, you can potentially update the token in AsyncStorage
    if (response.status === 200) {
      // Optionally, if the backend sends a new token for some reason
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
    } else if (response.status === 401) {
      console.log('Token is expired')
      // navigation.navigate('Home')
    }
    return response.data.jobData;
  } catch (error) {
    console.log(error);
    
    throw error;
  }
}

export const fetchInvoices = async () => {
  try {
    console.log('fetch');
    
    const response = await axios.get(`api/jobs/generateInvoice`);
    console.log('success', response.data);
    
    return response.data
  } catch (error) {
    return {error: error.response.data.message}
  }
};


export const sendInvoice = async (facilityId, email) => {
  try {
    console.log('fetch', facilityId, email);
    
    const response = await axios.post('api/jobs/sendInvoice', {
      facilityId: facilityId,
      email: email,
    });
    console.log('success');
    
    return response.data.invoiceData
  } catch (error) {
      console.error('Error generating invoice:', error);
      return {error: error.response.data.message}
  }
};
