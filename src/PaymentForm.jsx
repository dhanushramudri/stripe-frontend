// PaymentForm.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./PaymentForm.css"; // Import your custom CSS file

const PaymentForm = () => {
  const [amount, setAmount] = useState(100); // Set the default amount to $1
  const [clientSecret, setClientSecret] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    async function fetchClientSecret() {
      const secret = await createPaymentIntent();
      setClientSecret(secret);
    }
    fetchClientSecret();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret, // Obtained from the server
      {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      }
    );

    if (error) {
      console.error(error);
    } else {
      console.log("Payment succeeded:", paymentIntent);
      // Redirect or show success message
    }
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const createPaymentIntent = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/create-payment-intent",
        {
          amount: amount * 100, // Stripe requires amount in cents
        }
      );
      return response.data.clientSecret;
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };

  return (
    <div className="payment-form-container">
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="amount" className="label">
            Amount (in dollars):
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={handleAmountChange}
            className="input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="card-element" className="label">
            Card details:
          </label>
          <div id="card-element" className="card-element">
            <CardElement />
          </div>
        </div>
        <button type="submit" disabled={!stripe} className="pay-button">
          Pay
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
