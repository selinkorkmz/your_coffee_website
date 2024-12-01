import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import { fetchUserCart, pay } from "@/lib/requests";
import { CartProduct } from "@/types/product";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage(){
  const [myCart, setMyCart] = useState<CartProduct[]>([]);
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserCart().then((result) => {
      if (result.error) {
          alert(result.error)
          return;
      }

      setMyCart(result.cart);

  });
  }, [])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

        const form = event.currentTarget;
        const formElements = form.elements as typeof form.elements & {
            cardHolder: { value: string };
            address: { value: string };
            cvv: { value: string };
            expire: { value: string };
            cardNumber: { value: string };
        };

        pay({ cardNumber: formElements.cardNumber.value, cvv: formElements.cvv.value, holderName: formElements.cardHolder.value, expire: formElements.expire.value}, formElements.address.value).then((result) => {
            if (result.error) {
                alert(result.error);
                return;
            }

            navigate("/profile?display=orders")
        });
  }
  

  return(
   <div className="font-[sans-serif] lg:flex lg:items-center lg:justify-center lg:h-screen max-lg:py-4">
  <div className="bg-orange-200 p-8 w-full max-w-5xl max-lg:max-w-xl mx-auto rounded-md">
    <h2 className="text-3xl font-extrabold text-gray-800 text-center">Checkout</h2>

    <div className="grid lg:grid-cols-3 gap-6 max-lg:gap-8 mt-16">
      <div className="lg:col-span-2">
        <form className="mt-8" onSubmit={handleSubmit}>
          <div className="grid sm:col-span-2 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <input
                name="address"
                required
                type="text"
                placeholder="Address"
                className="px-4 py-3.5 bg-white text-gray-800 w-full text-sm border rounded-md focus:border-[#007bff] outline-none"
              />
            </div>
            <div>
              <input
                name="cardHolder"
                required
                type="text"
                placeholder="Name of card holder"
                className="px-4 py-3.5 bg-white text-gray-800 w-full text-sm border rounded-md focus:border-[#007bff] outline-none"
              />
            </div>
            <div>
              <input
                required
                name="cardNumber"
                type="text"
                placeholder="Card number"
                className="col-span-full px-4 py-3.5 bg-white text-gray-800 w-full text-sm border rounded-md focus:border-[#007bff] outline-none appearance-none"
              />
            </div>
            <div>
              <input
                required
                name="expire"
                type="text"
                placeholder="EXP."
                className="px-4 py-3.5 bg-white text-gray-800 w-full text-sm border rounded-md focus:border-[#007bff] outline-none appearance-none"
              />
            </div>
            <div>
              <input
                required
                name="cvv"
                type="text"
                placeholder="CVV"
                className="px-4 py-3.5 bg-white text-gray-800 w-full text-sm border rounded-md focus:border-[#007bff] outline-none appearance-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            <button
              type="submit"
              className="px-7 py-3.5 text-sm tracking-wide bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      <CheckoutSummary cart={myCart} />
    </div>
  </div>
</div>

  )
} 
