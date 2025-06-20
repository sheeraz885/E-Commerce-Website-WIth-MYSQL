import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogOut, Store, Search, ChevronRight, Plus } from 'lucide-react';
import axios from 'axios';
import Footer from './Footer';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  productId: number;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { user, logout } = useAuth();
  const { getTotalItems, addToCart } = useCart();

  const heroSlides: HeroSlide[] = [
    {
       id: 1,
    title: "Elegant Women's Pants",
    subtitle: "Discover our premium collection of comfortable & stylish pants for every occasion",
    image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    productId: 1
    },
    {
      id: 2,
      title: "Elegant Women's Dresses",
      subtitle: "Stylish and comfortable dresses for every season",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      productId: 2
    },
    {
      id: 3,
      title: "Classic Fit Trousers",
      subtitle: "Perfectly tailored trousers for a sharp, professional look",
      image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      productId: 3
    }
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    
    // Auto-rotate hero slides
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    // You could add a toast notification here
  };

  // Group products by category
  const productsByCategory = categories.map(category => ({
    category,
    products: products.filter(p => p.category_id === category.id)
  }));

  // Add "All Products" as the first category if there are categories
  if (categories.length > 0) {
    productsByCategory.unshift({
      category: { id: 0, name: "All Products", description: "" },
      products: searchQuery 
        ? products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : products
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
   <div className="min-h-screen font-manrope">
  {/* Header */}
  <header className="bg-bg-secondary shadow-lg border-b border-border sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Store className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-text">FashionHub</h1>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link
            to="/contact"
            className="text-text-secondary hover:text-text transition-colors"
          >
            Contact
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2 text-text-secondary hover:text-text transition-colors"
          >
            <ShoppingCart className="h-6 w-6" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <span className="text-text-secondary">Welcome, {user.name}</span>
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="btn-primary flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-text-secondary hover:text-text transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-text-secondary hover:text-text transition-colors"
              >
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  </header>
     {/* Hero Section */}
<section className="relative h-[600px] overflow-hidden">
  {/* Slides */}
  {heroSlides.map((slide, index) => (
    <div 
      key={slide.id}
      className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
        />
        {/* Dark overlay - adjust opacity as needed */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Content container - now transparent */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-md text-white p-8 backdrop-blur-sm">
            <span className="text-sm uppercase tracking-widest text-primary-200">
              New Arrival
            </span>
            <h1 className="text-4xl font-bold mt-2 mb-4 uppercase tracking-tight">
              {slide.title}
            </h1>
            <p className="text-gray-100 mb-6 text-lg">
              {slide.subtitle}
            </p>
            <Link
              to={`/product/${slide.productId}`}
              className="inline-flex items-center bg-[#D87D4A] hover:bg-[#c96f3e] text-white px-8 py-3 rounded-md font-medium transition-colors uppercase tracking-wider group"
            >
              Shop Now
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  ))}

  {/* Slide Indicators - Modern round buttons */}
  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
    {heroSlides.map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrentSlide(index)}
        className={`p-2 rounded-full ${index === currentSlide ? 'bg-[#D87D4A]' : 'bg-white bg-opacity-30'}`}
        aria-label={`Go to slide ${index + 1}`}
      >
        <span className="sr-only">Slide {index + 1}</span>
      </button>
    ))}
  </div>
</section>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for shirts, dresses, pants..."
            className="w-full bg-[#333333] text-white placeholder-[#AAAAAA] rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-[#D87D4A]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 text-[#D87D4A]" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Product Rows */}
        {productsByCategory.map(({ category, products }) => (
          products.length > 0 && (
            <div key={category.id} className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text">{category.name}</h2>
                {category.id !== 0 && (
                  <Link 
                    to={`/categories/${category.id}`}
                    className="flex items-center text-primary hover:text-primary-dark transition-colors"
                  >
                    View All <ChevronRight className="ml-1 h-5 w-5" />
                  </Link>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map((product) => (
                  <div key={product.id} className="card group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image_url || "https://via.placeholder.com/300"}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/300";
                        }}
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-bold bg-red-500 px-2 py-1 rounded">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-text mb-1">{product.name}</h3>
                      <p className="text-text-secondary text-sm mb-2 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xl font-bold text-primary">Rs: {product.price}</span>
                        {product.stock > 0 && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="text-sm bg-[#D87D4A] hover:bg-[#c96f3e] text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </button>
                            <Link
                              to={`/product/${product.id}`}
                              className="text-sm bg-transparent border border-[#D87D4A] text-[#D87D4A] hover:bg-[#D87D4A] hover:text-white px-3 py-1 rounded transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* "View All" card for categories */}
                {category.id !== 0 && products.length > 4 && (
                  <Link 
                    to={`/categories/${category.id}`}
                    className="card flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary transition-colors"
                  >
                    <div className="text-center p-6">
                      <ChevronRight className="mx-auto h-8 w-8 text-primary mb-2" />
                      <h3 className="text-lg font-medium text-text">View All</h3>
                      <p className="text-sm text-text-secondary mt-1">
                        {products.length - 4}+ more items
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )
        ))}

        {/* Empty state */}
        {productsByCategory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">No products found.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;