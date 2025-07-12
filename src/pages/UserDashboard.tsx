import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Package, ShoppingBag, LogOut, Home, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Order {
  id: number;
  user_id: number;
  user_name: string;
  total_amount: number | string | null;
  status: 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const UserDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      // Fetch orders instead of transactions
      const response = await axios.get(`http://localhost:3002/api/orders?user_id=${user?.id}`);
      const userOrders = response.data;
      setOrders(userOrders);
      
      // Calculate stats from orders
      const totalOrders = userOrders.length;
      const totalSpent = userOrders.reduce((sum: number, order: Order) => {
        const amount = order.total_amount ? Number(order.total_amount) : 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      const pendingOrders = userOrders.filter((order: Order) => 
        order.status === 'ordered' || order.status === 'shipped'
      ).length;
      const deliveredOrders = userOrders.filter((order: Order) => 
        order.status === 'delivered'
      ).length;
      
      setStats({ totalOrders, totalSpent, pendingOrders, deliveredOrders });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ordered':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-text-secondary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered':
        return 'bg-yellow-900/20 text-yellow-400 border border-yellow-800';
      case 'shipped':
        return 'bg-blue-900/20 text-blue-400 border border-blue-800';
      case 'delivered':
        return 'bg-green-900/20 text-green-400 border border-green-800';
      case 'cancelled':
        return 'bg-red-900/20 text-red-400 border border-red-800';
      default:
        return 'bg-bg-secondary text-text-secondary border border-border';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-bg-secondary shadow-lg border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-text">My Dashboard</h1>
            </div>
            
            <nav className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl text-white p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-xl opacity-90">Manage your orders and track your purchases</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-text">{stats.totalOrders}</p>
              </div>
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-text">RS: {stats.totalSpent.toFixed(2)}</p>
              </div>
              <Package className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-text">{stats.pendingOrders}</p>
              </div>
              <Clock className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Delivered</p>
                <p className="text-2xl font-bold text-text">{stats.deliveredOrders}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-text">Your Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-16 w-16 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary text-lg mb-2">No orders yet</p>
              <p className="text-text-secondary mb-4">Start shopping to see your orders here</p>
              <Link
                to="/"
                className="btn-primary inline-flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-bg-secondary/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-text">Order #{order.id}</h3>
                        <p className="text-sm text-text-secondary">
                          {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-text-secondary">Order Date</p>
                      <p className="font-medium text-text">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Items</p>
                      <p className="font-medium text-text">{order.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Total Amount</p>
                      <p className="font-medium text-text">{(Number(order.total_amount) || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Status</p>
                      <p className="font-medium text-text capitalize">{order.status}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-text mb-2">Order Items:</p>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-text-secondary">
                              {item.product_name} x {item.quantity}
                            </span>
                            <span className="text-text">{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;