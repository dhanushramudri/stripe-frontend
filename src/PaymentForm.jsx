import React, { useState, useEffect } from "react";
import axios from "axios";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

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
    }
  };

  const handleChange = (event) => {
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

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Amount (in dollars):
          <input type="number" value={amount} onChange={handleAmountChange} />
        </label>
      </div>
      <div>
        <label>
          Card details:
          <CardElement />
        </label>
      </div>
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};

export default PaymentForm;
