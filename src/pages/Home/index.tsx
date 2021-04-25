import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    let key = product.id;
    let value = product.amount;
    return (
      sumAmount = {
        ...sumAmount,
        [key]: value,
      }
    )
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      let produtos = await api.get('/products').then(response => {
        return response.data
      });
      let produtosFormatados = produtos.map((el : Product, i: number) => {
        return {
          id: el.id,
          image: el.image,
          price: formatPrice(el.price),
          title: el.title
        }
      })
      setProducts(produtosFormatados);

    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <ProductList>
      {
        products.map((product : Product, i: number) => {
          return (
            <li key={i}>
              <img src={product.image} alt={product.title} />
              <strong>{product.title}</strong>
              <span>{product.price}</span>
              <button
                type="button"
                data-testid="add-product-button"
                onClick={() => handleAddProduct(product.id)}
              >
                <div data-testid="cart-product-quantity">
                  <MdAddShoppingCart size={16} color="#FFF" />
                  {cartItemsAmount[product.id] || 0}
                </div>

                <span>ADICIONAR AO CARRINHO</span>
              </button>
            </li>
          )
        })
      }
    </ProductList>
  );
};

export default Home;
