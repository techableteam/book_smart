import axios from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import EditProfile from '../layout/client/EditProfile';

export const Signup = async (userData, endpoint) => {
  try {
    console.log(userData);
    const response = await axios.post(`api/${endpoint}/signup`, userData);
    return response.data;
  } catch (error) {
    return {error: error};
  }
};

export const Signin = async (credentials, endpoint) => {
  try {
    console.log(credentials);
    const response = await axios.post(`api/${endpoint}/login`, credentials);
    const aic = response.data.user?.aic;
    const AId = response.data.user?.AId;
    // console.log("login response:", response.data.user);
    if (aic !== undefined && aic !== null) {
      await AsyncStorage.setItem('aic', aic.toString());
    }
    if (AId !== undefined && AId !== null) {
      await AsyncStorage.setItem('AId', AId.toString());
      console.log("aid saved : ", AId);
    }
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.log(error)
    return {error: error};
  }
}

export const sendFCMToken = async (credentials, endpoint) => {
  try {
    const response = await axios.post(`api/${endpoint}/saveFCMToken`, credentials);
    return response.data;
  } catch (error) {
    console.error(error)    
    return {error: error.response.data.message};
  }
}

export const getShiftTypes = async (userData, endpoint) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.post(
      `/api/${endpoint}/getShiftTypes`, userData, {
      headers: {
        Authorization: `Bearer ${existingToken}`,
      },
    });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    // ✅ Log error response clearly
    if (error.response) {
    } else if (error.request) {
      console.error("❌ AXIOS ERROR: No response received");
      console.error(error.request);
    } else {
      console.error("❌ AXIOS SETUP ERROR:", error.message);
    }
    return { error };
  }
};

export const addShiftToStaff = async (endpoint, managerAic, staffId, shifts) => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log(managerAic, staffId, shifts)
    const response = await axios.post(
      `/api/${endpoint}/addShiftToStaff`,
      {
        managerAic,
        staffId,
        shifts,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = response.data || {};
    return {
      success: true,
      message: data.message ?? 'Shift(s) added.',
      staffInfo: data.staffInfo ?? [],
    };
  } catch (error) {
    console.error('addShiftToStaff error:', error?.response?.data || error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Request failed.',
      error,
    };
  }
};

export const addShiftType = async (body, endpoint) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(`/api/${endpoint}/addShiftType`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("addShiftType error:", error.response?.data || error.message);
    return { error };
  }
};

export const getAllUsersInRestau = async (endpoint) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`/api/${endpoint}/acknowledgedUsers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data?.users || []; 
  } catch (error) {
    console.error('get all user error:', error.message || error);
    return { error };
  }
};

export const getAllFacilitiesInAdmin = async () => {
  try {
    const response = await axios.get('/api/admin/getFacilities');
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.log(
      'getFacilities error:',
      error?.response?.data?.message || error.message || error
    );
    return [];
  }
};

export const createDJob = async ({
  shiftPayload,
  degreeId,
  facilityId,
  staffId,
  adminId,
  adminMade,
}) => {
  const body = {
    shift: shiftPayload,
    degree: Number(degreeId),
    adminId: adminId ? Number(adminId) : 0,
    adminMade: Boolean(adminMade),
    facilitiesId: facilityId ? Number(facilityId) : 0,
    clinicianId: Number(staffId) || 0,
  };
  console.log(body);

  try {
    const token = await AsyncStorage.getItem('token');

    const response = await axios.post(
      '/api/djobs',
      body,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message;
    console.error('❌ createDJob error:', msg);
    throw new Error(msg);
  }
};

export const getAllDjob = async (adminId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`/api/djobs/admin/${adminId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data || []; 
  } catch (error) {
    console.error('get all user error:', error.message || error);
    return { error };
  }
};

export const getStaffShiftInfo = async (endpoint, managerAic) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(
      `/api/${endpoint}/getAllStaffShiftInfo`,
      { managerAic },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data && response.data.staffInfo) {
      return response.data.staffInfo;
    } else {
      return [];
    }
  } catch (error) {
    console.log('getStaffShiftInfo error:', error.message || error);
    return [];
  }
};

export const addStaffToManager = async (endpoint, managerAic, staffList) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(
      `/api/${endpoint}/addStaffToManager`, {
      managerAic,
      staffList,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('addStaffToManager error:', error);
    return { error };
  }
};

export const deleteShiftType = async (body, endpoint) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(`/api/${endpoint}/deleteShiftType`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error('deleteShiftType error:', error.message || error);
    return { error };
  }
};

export const updateShiftType = async (body, endpoint) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(`/api/${endpoint}/updateShiftType`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error('deleteShiftType error:', error.message || error);
    return { error };
  }
};

export const deleteStaffFromManager = async (endpoint, managerAic, staffId) => {
  console.log(managerAic);
  console.log(staffId);
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(
      `/api/${endpoint}/deleteStaffFromManager`,
      {
        managerAic,
        staffId: staffId.toString(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // ✅ Log error response clearly
    if (error.response) {
    } else if (error.request) {
      console.error("❌ AXIOS ERROR: No response received");
      console.error(error.request);
    } else {
      console.error("❌ AXIOS SETUP ERROR:", error.message);
    }
    return { error };
  }
};

export const updateDjob = async ({
  DJobId,
  shift,
  degree,
  adminId,
  adminMade,
  facilitiesId,
  clinicianId,
  status,
}) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.post(
      `api/djobs/update`,
      {
        DJobId,
        shift,
        degree,
        adminId,
        adminMade,
        facilitiesId,
        clinicianId,
        status,
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    console.log(res.data);
    if (res.data?.message === 'Updated') {
      return { ok: true, data: res.data.data };
    } else {
      return { ok: false, error: { message: res.data?.message || 'Update failed' } };
    }
  } catch (err) {
    return { ok: false, error: normalizeError(err) };
  }
};

export const deleteShiftFromStaff = async (endpoint, managerAic, staffId, shiftId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(
      `/api/${endpoint}/deleteShiftFromStaff`,
      {
        managerAic,
        staffId: staffId.toString(),
        shiftId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return { success: true, message: response.data.message || 'Shift deleted successfully.' };

  } catch (error) {
    if (error.response) {
      console.error("❌ AXIOS RESPONSE ERROR:", error.response.data);
      return { success: false, message: error.response.data.message || 'Error occurred during deletion' };
    } else if (error.request) {
      console.error("❌ AXIOS ERROR: No response received");
      console.error(error.request);
      return { success: false, message: 'No response received from the server.' };
    } else {
      console.error("❌ AXIOS SETUP ERROR:", error.message);
      return { success: false, message: 'Error setting up request.' };
    }
  }
};

export const deleteDjob = async (DjobId,) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(
      `/api/djobs/delete`,
      {
        "DJobId": DjobId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return { success: true, message: response.data.message || 'Shift deleted successfully.' };

  } catch (error) {
    if (error.response) {
      console.error("❌ AXIOS RESPONSE ERROR:", error.response.data);
      return { success: false, message: error.response.data.message || 'Error occurred during deletion' };
    } else if (error.request) {
      console.error("❌ AXIOS ERROR: No response received");
      console.error(error.request);
      return { success: false, message: 'No response received from the server.' };
    } else {
      console.error("❌ AXIOS SETUP ERROR:", error.message);
      return { success: false, message: 'Error setting up request.' };
    }
  }
};

const normalizeError = (err) => {
  if (err?.response?.data?.message)
    return { message: err.response.data.message };
  if (err?.message)
    return { message: err.message };
  return { message: 'Unknown error occurred' };
};

export const getAssignedShifts = async (endpoint) => {
  try {
    const aicStr = await AsyncStorage.getItem('aic');
    console.log(aicStr);
    console.log(endpoint);
    if (!aicStr) throw new Error('Missing AIC in storage');
    const userId = Number(aicStr);
    const res = await axios.post(
      `api/${endpoint}/getAssignedShift`,
      { userId });

    console.log("getAssignedShifts", res.data?.assignedShift);

    const list = Array.isArray(res.data?.assignedShift)
      ? res.data.assignedShift
      : [];

    return { ok: true, data: list };
  } catch (err) {
    return { ok: false, error: normalizeError(err) };
  }
};

export const getDjobForClinician = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const aicStr = await AsyncStorage.getItem('aic');

    if (!aicStr) throw new Error('Missing AIC in storage');
    const aic = Number(aicStr);

    const res = await axios.post(
      `api/djobs/clinicianDjobs`,
      { aic },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const list = Array.isArray(res.data?.data) ? res.data.data : [];

    return { ok: true, data: list };
  } catch (err) {
    console.error('getDjobForClinician error:', err);
    return { ok: false, error: normalizeError(err) };
  }
};

export const applyForShift = async (DJobId, clinicianId) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const res = await axios.post(
      'api/djobs/apply',
      { DJobId, clinicianId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { ok: true, data: res.data };
  } catch (err) {
    console.error('applyForShift error:', err);
    return { ok: false, error: normalizeError(err) };
  }
};

export const reviewApplicant = async (DJobId, clinicianId, action) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const res = await axios.post(
      'api/djobs/reviewapplicant',
      { DJobId, clinicianId, action },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { ok: true, data: res.data };
  } catch (err) {
    console.error('reviewApplicant error:', err);
    return { ok: false, error: normalizeError(err) };
  }
};

export const getDjobForFacilitiesById = async (FAic) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const aic = Number(FAic);

    const res = await axios.post(
      `api/djobs/getfacilitydjobs`,
      { aic },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const list = Array.isArray(res.data?.data) ? res.data.data : [];

    return { ok: true, data: list };
  } catch (err) {
    console.error('getDjobForFacilites error:', err);
    return { ok: false, error: normalizeError(err) };
  }
};

export const getDjobForFacilities = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const aicStr = await AsyncStorage.getItem('aic');

    if (!aicStr) throw new Error('Missing AIC in storage');
    const aic = Number(aicStr);

    const res = await axios.post(
      `api/djobs/getfacilitydjobs`,
      { aic },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const list = Array.isArray(res.data?.data) ? res.data.data : [];

    return { ok: true, data: list };
  } catch (err) {
    console.error('getDjobForFacilites error:', err);
    return { ok: false, error: normalizeError(err) };
  }
};

export const setStatusFromUser = async ({endpoint, assignedShiftId, status }) => {
  try {
    const aicStr = await AsyncStorage.getItem('aic');
    const existingToken = await AsyncStorage.getItem('token');
    if (!aicStr) throw new Error('Missing AIC in storage');

    const payload = {
      userAic: Number(aicStr),
      assignedShiftId: Number(assignedShiftId),
      status, // 'accept' | 'reject' | 'cancel'
    };

    const res = await axios.post(
      `api/${endpoint}/setStatusFromUser`, 
      payload,
      { headers: {
        Authorization: `Bearer ${existingToken}`,
      }},
    );

    // Robust success check: message text + rows updated
    const okByRows = typeof res.data?.adminRowsUpdated === 'number'
      ? res.data.adminRowsUpdated > 0
      : true; // if backend omits it, still treat 200 as success

    const okByMessage = typeof res.data?.message === 'string'
      ? /synchron/i.test(res.data.message) || /ok/i.test(res.data.message)
      : true;

    if (okByRows && okByMessage) {
      return { ok: true, data: res.data };
    }

    // 200 but backend signals failure
    return {
      ok: false,
      error: {
        code: res.status,
        message: res.data?.message || 'Update failed',
        details: res.data,
      },
    };
  } catch (err) {
    return { ok: false, error: normalizeError(err) };
  }
};

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
    const response = await axios.post(`api/${endpoint}/verifyCode`, credentials);
    return response;
  } catch (error) {    
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

export const getDegreeListInAdmin = async (endpoint) => {
  try {
    const response = await axios.get(`/api/${endpoint}/getList`);
    if (response.status === 200) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching degree list:', error);
    return [];
  }
};

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

export const getLocationList = async (endpoint, type, user_id) => {
  try {
    const existingToken = await AsyncStorage.getItem('token');
    const response = await axios.get(`api/${endpoint}/getList?type=${type}&user_id=${user_id}`, {
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
    console.log("update", updateData);
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

export const sendMessage = async (data) => {
  try {
    const response = await axios.post(`api/admin/sendMessage`, data);
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
    if (response?.data?.token) {
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
