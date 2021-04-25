import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}


interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
    let estoque =  await api.get<Stock>(`/stock/${productId}`).then(response => {
      return response.data
      });


      let jaAdcionado = cart.filter(product => product.id === productId)

      if (jaAdcionado[0]) {
        let newAmount = jaAdcionado[0].amount + 1;

        if (estoque.amount >= newAmount) {
          let index = cart.findIndex(product => product.id === productId);
          let newCart = [...cart];
          newCart[index].amount = newAmount;
          setCart(newCart);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      } else {
        let produtos = await api.get(`/products/${productId}`).then(response => {
          return response.data
        });
        let newCart = [...cart]
        newCart.push({
          id: productId,
          amount: 1,
          image: produtos.image,
          title: produtos.title,
          price: produtos.price,
        });
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      }


    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      let jaAdcionado = cart.filter(product => product.id === productId)

      if (jaAdcionado[0]) {
        console.log(cart)
        let newCart = [...cart];
        newCart = newCart.filter(product => productId !== product.id)
        console.log(newCart)
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      } else {
        toast.error('Erro na remoção do produto');
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      let estoque =  await api.get<Stock>(`/stock/${productId}`).then(response => {
        return response.data
      });
  
      if (estoque.amount >= amount && amount > 0) {
        let jaAdcionado = cart.filter(product => product.id === productId)
  
        if (jaAdcionado[0]) {
          if (jaAdcionado[0].amount <= 0) {
            return 
          } else {
    
            if (estoque.amount >= amount) {
              let index = cart.findIndex(product => product.id === productId);
              let newCart = [...cart];
              newCart[index].amount = amount;
              setCart(newCart);
              localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
            } else {
              toast.error('Quantidade solicitada fora de estoque');
            }
          }
        } else {
          toast.error('Quantidade solicitada fora de estoque'); 
        }
      } else {
        toast.error('Quantidade solicitada fora de estoque'); 
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
