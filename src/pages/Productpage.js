import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getProductDetails } from '../actions/productActions'; // Adjust the path as needed
import styled from 'styled-components';

// Styled Components
const ProductPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  max-width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  @media (min-width: 768px) {
    width: 50%;
    max-width: 50%;
    height: auto;
  }
`;

const ProductDetails = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  @media (min-width: 768px) {
    width: 60%;
    padding-left: 2rem;
  }
`;

const ProductTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const ProductDescription = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const ProductPrice = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #007bff;
`;

const Productpage = () => {
  const { productNumber } = useParams();
  const dispatch = useDispatch();

  const productDetails = useSelector((state) => state.product);
  const { loading, error, product } = productDetails;

  useEffect(() => {
    if (productNumber) {
      dispatch(getProductDetails(productNumber));
    }
  }, [dispatch, productNumber]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!product) {
    return <p>No product found.</p>;
  }

  return (
    <ProductPageContainer>
      <ProductImage src={product.images[0]} alt={product.name} />
      <ProductDetails>
        <ProductTitle>{product.name}</ProductTitle>
        <ProductDescription>{product.description}</ProductDescription>
        <ProductPrice>Price: ${product.price}</ProductPrice>
        {/* You can add more product details here as needed */}
      </ProductDetails>
    </ProductPageContainer>
  );
};

export default Productpage;
