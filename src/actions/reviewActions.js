import axios from 'axios';
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const fetchReviews = (productId) => async (dispatch) => {
  try {
    dispatch({ type: 'FETCH_REVIEWS_REQUEST' });

    const response = await axios.get(`${backendUrl}/api/reviews/${productId}`);
    const reviews = response.data;

    dispatch({ type: 'FETCH_REVIEWS_SUCCESS', payload: reviews });
  } catch (error) {
    dispatch({ type: 'FETCH_REVIEWS_FAILURE', payload: error.message });
  }
};

export const addReview = (productId, reviewData) => async (dispatch) => {
  try {
    dispatch({ type: 'ADD_REVIEW_REQUEST' });

    const response = await axios.post(`${backendUrl}/api/reviews/${productId}`, reviewData);
    const newReview = response.data;

    dispatch({ type: 'ADD_REVIEW_SUCCESS', payload: newReview });
  } catch (error) {
    dispatch({ type: 'ADD_REVIEW_FAILURE', payload: error.message });
  }
};
