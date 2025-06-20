// import React, { useState, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
// import { TrendingUp, DollarSign, Package, Users, Calendar } from 'lucide-react';
// import axios from 'axios';

// interface AnalyticsData {
//   monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>;
//   topProducts: Array<{ name: string; sales: number; revenue: number }>;
//   ordersByStatus: Array<{ status: string; count: number; color: string }>;
//   totalStats: {
//     totalRevenue: number;
//     totalOrders: number;
//     totalProducts: number;
//     totalCustomers: number;
//   };
// }

// const AdminAnalytics: React.FC = () => {
//   const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [dateRange, setDateRange] = useState('6months');

//   useEffect(() => {
//     fetchAnalyticsData();
//   }, [dateRange]);

//   const fetchAnalyticsData = async () => {
//     try {
//       const response = await axios.get(`http://localhost:3001/api/analytics?range=${dateRange}`);
//       setAnalyticsData(response.data);
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//       // Mock data for demo
//       setAnalyticsData({
//         monthlyRevenue: [
//           { month: 'Jan', revenue: 4500, orders: 45 },
//           { month: 'Feb', revenue: 5200, orders: 52 },
//           { month: 'Mar', revenue: 4800, orders: 48 },
//           { month: 'Apr', revenue: 6100, orders: 61 },
//           { month: 'May', revenue: 7300, orders: 73 },
//           { month: 'Jun', revenue: 8200, orders: 82 }
//         ],
//         topProducts: [
//           { name: 'Classic White Shirt', sales: 156, revenue: 4680 },
//           { name: 'Blue Denim Jeans', sales: 134, revenue: 6698 },
//           { name: 'Black Leather Shoes', sales: 98, revenue: 8820 },
//           { name: 'Summer Dress', sales: 87, revenue: 3480 },
//           { name: 'Casual Sneakers', sales: 76, revenue: 4560 }
//         ],
//         ordersByStatus: [
//           { status: 'Delivered', count: 245, color: '#10B981' },
//           { status: 'Shipped', count: 67, color: '#3B82F6' },
//           { status: 'Ordered', count: 34, color: '#F59E0B' },
//           { status: 'Cancelled', count: 12, color: '#EF4444' }
//         ],
//         totalStats: {
//           totalRevenue: 36100,
//           totalOrders: 358,
//           totalProducts: 24,
//           totalCustomers: 189
//         }
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-4 text-text-secondary">Loading analytics...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!analyticsData) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-text-secondary">Failed to load analytics data</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-text">Analytics Dashboard</h2>
//         <select
//           value={dateRange}
//           onChange={(e) => setDateRange(e.target.value)}
//           className="input-field w-auto"
//         >
//           <option value="1month">Last Month</option>
//           <option value="3months">Last 3 Months</option>
//           <option value="6months">Last 6 Months</option>
//           <option value="1year">Last Year</option>
//         </select>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="card p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-text-secondary text-sm">Total Revenue</p>
//               <p className="text-2xl font-bold text-text">${analyticsData.totalStats.totalRevenue.toLocaleString()}</p>
//             </div>
//             <DollarSign className="h-10 w-10 text-green-500" />
//           </div>
//         </div>

//         <div className="card p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-text-secondary text-sm">Total Orders</p>
//               <p className="text-2xl font-bold text-text">{analyticsData.totalStats.totalOrders}</p>
//             </div>
//             <Package className="h-10 w-10 text-blue-500" />
//           </div>
//         </div>

//         <div className="card p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-text-secondary text-sm">Products</p>
//               <p className="text-2xl font-bold text-text">{analyticsData.totalStats.totalProducts}</p>
//             </div>
//             <TrendingUp className="h-10 w-10 text-purple-500" />
//           </div>
//         </div>

//         <div className="card p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-text-secondary text-sm">Customers</p>
//               <p className="text-2xl font-bold text-text">{analyticsData.totalStats.totalCustomers}</p>
//             </div>
//             <Users className="h-10 w-10 text-orange-500" />
//           </div>
//         </div>
//       </div>

//       {/* Charts Row 1 */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Monthly Revenue Chart */}
//         <div className="card p-6">
//           <h3 className="text-lg font-semibold text-text mb-4">Monthly Revenue & Orders</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={analyticsData.monthlyRevenue}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//               <XAxis dataKey="month" stroke="#9CA3AF" />
//               <YAxis stroke="#9CA3AF" />
//               <Tooltip 
//                 contentStyle={{ 
//                   backgroundColor: '#1F2937', 
//                   border: '1px solid #374151',
//                   borderRadius: '8px',
//                   color: '#F9FAFB'
//                 }}
//               />
//               <Bar dataKey="revenue" fill="#D87D4A" name="Revenue ($)" />
//               <Bar dataKey="orders" fill="#FBAF85" name="Orders" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Order Status Distribution */}
//         <div className="card p-6">
//           <h3 className="text-lg font-semibold text-text mb-4">Order Status Distribution</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={analyticsData.ordersByStatus}
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={100}
//                 fill="#8884d8"
//                 dataKey="count"
//                 label={({ status, count }) => `${status}: ${count}`}
//               >
//                 {analyticsData.ordersByStatus.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip 
//                 contentStyle={{ 
//                   backgroundColor: '#1F2937', 
//                   border: '1px solid #374151',
//                   borderRadius: '8px',
//                   color: '#F9FAFB'
//                 }}
//               />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Top Products Table */}
//       <div className="card overflow-hidden">
//         <div className="p-6 border-b border-border">
//           <h3 className="text-lg font-semibold text-text">Top Selling Products</h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-border">
//             <thead className="bg-bg-secondary">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
//                   Product
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
//                   Units Sold
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
//                   Revenue
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
//                   Avg. Price
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-border">
//               {analyticsData.topProducts.map((product, index) => (
//                 <tr key={index} className="hover:bg-bg-secondary/50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
//                     {product.name}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
//                     {product.sales}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
//                     ${product.revenue.toLocaleString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
//                     ${(product.revenue / product.sales).toFixed(2)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminAnalytics;