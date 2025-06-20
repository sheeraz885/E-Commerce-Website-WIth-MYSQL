import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ArrowLeft, ShoppingCart, Star, Package, Truck, Shield, Heart, Plus, Minus } from 'lucide-react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category_id: number;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState('');
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setMessage('Product added to cart!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product) return;
    
    // Add to cart and redirect to checkout
    addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-text-secondary text-lg">Product not found</p>
          <Link to="/" className="text-primary hover:underline mt-2 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-light mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        {message && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
            <p className="text-green-400">{message}</p>
          </div>
        )}

        <div className="card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-w-1 aspect-h-1 overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-96 lg:h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="p-8">
              <h1 className="text-3xl font-bold text-text mb-4">{product.name}</h1>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-text-secondary">(124 reviews)</span>
              </div>

              <p className="text-text-secondary text-lg mb-6 leading-relaxed">{product.description}</p>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-primary">Rs: {product.price}</span>
                <span className="text-text-secondary">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-2 p-3 bg-bg rounded-lg border border-border">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm text-text">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-bg rounded-lg border border-border">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm text-text">2 Year Warranty</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-bg rounded-lg border border-border">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm text-text">Easy Returns</span>
                </div>
              </div>

              {/* Purchase Section */}
              {product.stock > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-text">Quantity:</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1 rounded-full bg-bg-secondary border border-border hover:bg-border transition-colors"
                      >
                        <Minus className="h-4 w-4 text-text" />
                      </button>
                      
                      <span className="w-12 text-center text-text font-medium">
                        {quantity}
                      </span>
                      
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-1 rounded-full bg-bg-secondary border border-border hover:bg-border transition-colors"
                      >
                        <Plus className="h-4 w-4 text-text" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={purchasing}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {purchasing ? 'Processing...' : 'Buy Now'}
                    </button>
                    <button className="btn-secondary px-6">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>

                  {!user && (
                    <p className="text-sm text-text-secondary text-center">
                      <Link to="/login" className="text-primary hover:underline">
                        Login
                      </Link>{' '}
                      to purchase this product
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-400 font-medium">Out of Stock</p>
                  <p className="text-text-secondary text-sm">This product is currently unavailable</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;