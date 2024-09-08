import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../actions/productActions';
import { addFavouriteProduct, removeFavouriteProduct } from '../actions/favouriteActions';
import { addToCart } from '../actions/cartActions';
import styled from 'styled-components';
import Heroslider from '../components/Heroslider';
import Productcard from '../components/Productcard';
import Title from '../components/Title';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';

const ProductListContainer = styled(Slider)`
  .slick-slide {
    display: flex;
    justify-content: center;
    padding: 10px;
  }
`;

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const productState = useSelector((state) => state.product);
  const { loading, products, error } = productState;
  const favouriteState = useSelector((state) => state.favourite);
  const { favourites } = favouriteState;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  const handleAddToCart = (prodId) => {
    dispatch(addToCart(prodId, 1));
  };

  const handleToggleFavorite = (prodId) => {
    const isfavourite = favourites.includes(prodId);
    if (isfavourite) {
      dispatch(removeFavouriteProduct(prodId));
    } else {
      dispatch(addFavouriteProduct(prodId));
    }
  };

  return (
    <>
      <Heroslider />
      <Title level={1} color="#007bff" align="center" marginBottom="2rem">
        New Arrivals For You
      </Title>
      <ProductListContainer {...settings}>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {products && products.map((product) => (
          <div key={product._id} onClick={() => {
            console.log(`Product Number: ${product.productNumber}`);
            navigate(`/product/${product.productNumber}`);
          }}>
            <Productcard
              images={product.images}
              title={product.name}
              description={product.description}
              price={`$${product.price}`}
              onAddToCart={() => handleAddToCart(product._id)}
              isfavourite={favourites.includes(product._id)}
              onToggleFavorite={() => handleToggleFavorite(product._id)}
            />
          </div>
        ))}
      </ProductListContainer>
    </>
  );
};

export default Home;
