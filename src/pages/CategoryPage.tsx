import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Package } from 'lucide-react';

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

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Validate category ID
        if (!id || isNaN(parseInt(id))) {
          setError("Invalid category ID");
          return;
        }

        const categoryId = parseInt(id);

        // For "All Products" (id=0)
        if (categoryId === 0) {
          setCategory({ id: 0, name: "All Products", description: "Browse all our products" });
          const productsRes = await axios.get('http://localhost:3002/api/products');
          setProducts(productsRes.data);
          return;
        }

        // For specific categories
        try {
          const categoryRes = await axios.get(`http://localhost:3002/api/categories/${categoryId}`);
          setCategory(categoryRes.data);
        } catch (err) {
          setError("Category not found");
          return;
        }

        // Fetch products
        const productsRes = await axios.get('http://localhost:3002/api/products');
        const filteredProducts = productsRes.data.filter(
          (p: Product) => p.category_id === categoryId
        );
        setProducts(filteredProducts);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-md text-center p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text mb-2">Error Loading Category</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link
            to="/"
            className="btn-primary inline-flex items-center px-6 py-3"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-manrope">
      {/* Header with back button */}
      <div className="bg-bg-secondary py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary-dark">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-text mb-2">{category?.name}</h1>
        <p className="text-text-secondary mb-8">{category?.description}</p>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative overflow-hidden bg-gray-100 aspect-square">
                  <img
                    src={product.image_url || "https://via.placeholder.com/300"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold bg-red-500 px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-text mb-2">{product.name}</h3>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-xl font-bold text-primary">RS: {product.price}</span>
                  {product.stock > 0 && (
                    <Link
                      to={`/product/${product.id}`}
                      className="mt-4 btn-primary block w-full"
                    >
                      View Product
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-bg-secondary rounded-lg p-8 max-w-md mx-auto">
              <Package className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">No Products Found</h3>
              <p className="text-text-secondary mb-6">
                {category?.id === 0 
                  ? "There are currently no products available." 
                  : "There are currently no products available in this category."}
              </p>
              <Link
                to="/"
                className="btn-primary inline-flex items-center px-6 py-3"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;