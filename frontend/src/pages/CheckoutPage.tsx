export default function CheckoutPage(){
    <div class="font-[sans-serif] lg:flex lg:items-center lg:justify-center lg:h-screen max-lg:py-4">
      <div class="bg-purple-100 p-8 w-full max-w-5xl max-lg:max-w-xl mx-auto rounded-md">
        <h2 class="text-3xl font-extrabold text-gray-800 text-center">Checkout</h2>

        <div class="grid lg:grid-cols-3 gap-6 max-lg:gap-8 mt-16">
          <div class="lg:col-span-2">
            <h3 class="text-lg font-bold text-gray-800">Choose your payment method</h3>

            <div class="grid gap-4 sm:grid-cols-2 mt-4">
              <div class="flex items-center">
                <input type="radio" class="w-5 h-5 cursor-pointer" id="card" checked />
                <label for="card" class="ml-4 flex gap-2 cursor-pointer">
                  <img src="https://readymadeui.com/images/visa.webp" class="w-12" alt="card1" />
                  <img src="https://readymadeui.com/images/american-express.webp" class="w-12" alt="card2" />
                  <img src="https://readymadeui.com/images/master.webp" class="w-12" alt="card3" />
                </label>
              </div>

              <div class="flex items-center">
                <input type="radio" class="w-5 h-5 cursor-pointer" id="paypal" />
                <label for="paypal" class="ml-4 flex gap-2 cursor-pointer">
                  <img src="https://readymadeui.com/images/paypal.webp" class="w-20" alt="paypalCard" />
                </label>
              </div>
            </div>

            <form class="mt-8">
              <div class="grid sm:col-span-2 sm:grid-cols-2 gap-4">
                <div>
                  <input type="text" placeholder="Name of card holder"
                    class="px-4 py-3.5 bg-white text-gray-800 w-full text-sm border rounded-md focus:border-[#007bff] outline-none" />
                </div>
                <div>
                  <input type="number" placeholder="Postal code"
                    class="px-4 py-3.5 bg-white text-gray-800 w-full text-sm border rounded-md focus:border-[#007bff] outline-none" />
                </div>
                <div>
                  <input type="number" placeholder="Card number"
                    class="col-span-full px-4 py-3.5 bg-white text-gray-800 w-full text-sm border rounded-md focus:border-[#007bff] outline-none" />
                </div>
                <div>
                  <input type="number" placeholder="EXP."
                    class="px-4 py-3.5 bg-white text-gray-800 w-full text-sm border rounded-md focus:border-[#007bff] outline-none" />
                </div>
                <div>
                  <input type="number" placeholder="CVV"
                    class="px-4 py-3.5 bg-white text-gray-800 w-full text-sm border rounded-md focus:border-[#007bff] outline-none" />
                </div>
              </div>

              <div class="flex flex-wrap gap-4 mt-8">
                <button type="button"
                  class="px-7 py-3.5 text-sm tracking-wide bg-white hover:bg-gray-50 text-gray-800 rounded-md">Pay later</button>
                <button type="button"
                  class="px-7 py-3.5 text-sm tracking-wide bg-blue-600 text-white rounded-md hover:bg-blue-700">Submit</button>
              </div>
            </form>
          </div>

          <div class="bg-white p-6 rounded-md max-lg:-order-1">
            <h3 class="text-lg font-bold text-gray-800">Summary</h3>
            <ul class="text-gray-800 mt-6 space-y-3">
              <li class="flex flex-wrap gap-4 text-sm">Sub total <span class="ml-auto font-bold">$48.00</span></li>
              <li class="flex flex-wrap gap-4 text-sm">Discount (20%) <span class="ml-auto font-bold">$4.00</span></li>
              <li class="flex flex-wrap gap-4 text-sm">Tax <span class="ml-auto font-bold">$4.00</span></li>
              <hr />
              <li class="flex flex-wrap gap-4 text-base font-bold">Total <span class="ml-auto">$52.00</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
}