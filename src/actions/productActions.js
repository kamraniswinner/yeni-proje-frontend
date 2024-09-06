import axios from 'axios';
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

export const fetchProducts = () => async (dispatch) => {
  dispatch({ type: 'PRODUCTS_REQUEST' });

  try {
    const response = await axios.get(`${backendUrl}/api/products`);
    const products = response.data;
    dispatch({ type: 'PRODUCTS_SUCCESS', payload: products });
  } catch (error) {
    dispatch({ type: 'PRODUCTS_FAILURE', payload: error.message });
  }
};

export const getProductDetails = (productId) => async (dispatch) => {
  dispatch({ type: 'PRODUCT_DETAILS_REQUEST' });

  try {
    const response = await axios.get(`${backendUrl}/api/products/${productId}`);
    const product = response.data;
    dispatch({ type: 'PRODUCT_DETAILS_SUCCESS', payload: product });
  } catch (error) {
    dispatch({ type: 'PRODUCT_DETAILS_FAILURE', payload: error.message });
  }
};
