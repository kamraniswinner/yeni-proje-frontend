import axios from 'axios';
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const createOrder = (orderData) => async (dispatch) => {
  dispatch({ type: 'ORDER_CREATE_REQUEST' });

  try {
    const response = await axios.post(`${backendUrl}/api/orders`, orderData);
    const order = response.data;
    dispatch({ type: 'ORDER_CREATE_SUCCESS', payload: order });
  } catch (error) {
    dispatch({ type: 'ORDER_CREATE_FAILURE', payload: error.message });
  }
};

export const getOrderDetails = (orderId) => async (dispatch) => {
  dispatch({ type: 'ORDER_DETAILS_REQUEST' });

  try {
    const response = await axios.get(`${backendUrl}/api/orders/${orderId}`);
    const order = response.data;
    dispatch({ type: 'ORDER_DETAILS_SUCCESS', payload: order });
  } catch (error) {
    dispatch({ type: 'ORDER_DETAILS_FAILURE', payload: error.message });
  }
};
