import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CreditCard, Truck, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface DeliveryInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const Checkout: React.FC = () => {
  const [step, setStep] = useState(1);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        user_id: user?.id,
        items: cartItems,
        delivery_info: deliveryInfo,
        payment_method: paymentMethod,
        total_amount: getTotalPrice() * 1.1, // Including tax
        status: 'ordered'
      };

      const response = await axios.post('http://localhost:3002/api/orders', orderData);
      setOrderId(response.data.id);
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-text mb-4">Order Placed Successfully!</h2>
          <p className="text-text-secondary mb-6">
            Your order #{orderId} has been placed and will be processed soon.
          </p>
          <div className="space-y-3">
            <Link to="/dashboard" className="btn-primary block">
              View Order Status
            </Link>
            <Link to="/" className="btn-secondary block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-light mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-text mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= stepNumber
                    ? 'bg-primary text-white'
                    : 'bg-bg-secondary text-text-secondary border border-border'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-16 h-1 mx-4 ${
                    step > stepNumber ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </h2>
                
                <form onSubmit={handleDeliverySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryInfo.fullName}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, fullName: e.target.value})}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={deliveryInfo.email}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, email: e.target.value})}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={deliveryInfo.phone}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Address *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={deliveryInfo.address}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryInfo.city}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, city: e.target.value})}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryInfo.state}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, state: e.target.value})}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryInfo.zipCode}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, zipCode: e.target.value})}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </h2>
                
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-bg-secondary">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-text">Cash on Delivery</div>
                        <div className="text-sm text-text-secondary">Pay when you receive your order</div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-bg-secondary">
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-text">UPI Payment</div>
                        <div className="text-sm text-text-secondary">Pay using UPI apps like GPay, PhonePe</div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-bg-secondary">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-text">Credit/Debit Card</div>
                        <div className="text-sm text-text-secondary">Pay securely with your card</div>
                      </div>
                    </label>
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Review Order
                  </button>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-text mb-6">Order Review</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-text mb-2">Delivery Information</h3>
                    <div className="text-text-secondary text-sm">
                      <p>{deliveryInfo.fullName}</p>
                      <p>{deliveryInfo.email}</p>
                      <p>{deliveryInfo.phone}</p>
                      <p>{deliveryInfo.address}</p>
                      <p>{deliveryInfo.city}, {deliveryInfo.state} {deliveryInfo.zipCode}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-text mb-2">Payment Method</h3>
                    <p className="text-text-secondary text-sm capitalize">
                      {paymentMethod === 'cod' ? 'Cash on Delivery' : 
                       paymentMethod === 'upi' ? 'UPI Payment' : 'Credit/Debit Card'}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-text mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-text-secondary">
                            {item.name} x {item.quantity}
                          </span>
                          <span className="text-text"> {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h2 className="text-xl font-bold text-text mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-text-secondary">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="text-text">RS: {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <hr className="border-border" />
                
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>RS: {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax</span>
                  <span>RS: {(getTotalPrice() * 0.1).toFixed(2)}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-lg font-bold text-text">
                  <span>Total</span>
                  <span>RS: {(getTotalPrice() * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;