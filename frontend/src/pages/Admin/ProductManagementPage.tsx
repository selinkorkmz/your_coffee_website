import { useAuth } from "@/components/AuthContext";
import { addProductToDatabase, deleteProductFromDatabase, fetchAllProducts, updateDiscountRate, updatePrice, updateStock } from "@/lib/requests";
import { Product } from "@/types/product";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';

function ProductManagementPage() {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
  });


  useEffect(() => {
    if (products?.success) {
      setFilteredProducts(products.products)
    }
  }, [products])

  return (
    <section className="bg-amber-50 p-3 sm:p-5 antialiased">
      <div className="mx-auto max-w-screen-2xl px-4 lg:px-12">
        <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
          <SearchAndFilterRow refetch={refetch} />
          <ProductTable products={filteredProducts} refetch={refetch} />
        </div>
      </div>
    </section>

  );
}

function FilterDropdown() {
  return (
    <div id="filterDropdown" className="z-10 hidden px-3 pt-1 bg-white rounded-lg shadow w-80 dark:bg-gray-700 right-0">
      <div className="flex items-center justify-between pt-2">
        <h6 className="text-sm font-medium text-black dark:text-white">Filters</h6>
        <div className="flex items-center">
          <a href="#" className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline">Save view</a>
          <a href="#" className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline">Clear all</a>
        </div>
      </div>
      <div className="pt-3 pb-2">
        <label htmlFor="input-group-search" className="sr-only">Search</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input type="text" id="input-group-search" className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search keywords..." />
        </div>
      </div>
      <div id="accordion-flush" data-accordion="collapse" data-active-classes="text-black dark:text-white" data-inactive-classes="text-gray-500 dark:text-gray-400">
        <h2 id="category-heading">
          <button type="button" className="flex items-center justify-between w-full py-2 px-1.5 text-sm font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" data-accordion-target="#category-body" aria-expanded="true" aria-controls="category-body">
            <span>Category</span>
            <svg aria-hidden="true" data-accordion-icon="" className="w-5 h-5 rotate-180 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>
        </h2>
        <div id="category-body" className="hidden" aria-labelledby="category-heading">
          <div className="py-2 font-light border-b border-gray-200 dark:border-gray-600">
            <ul className="space-y-2">
              <li className="flex items-center">
                <input id="apple" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="apple" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Apple (56)</label>
              </li>
              <li className="flex items-center">
                <input id="microsoft" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="microsoft" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Microsoft (45)</label>
              </li>
              <li className="flex items-center">
                <input id="logitech" type="checkbox" value="" checked className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="logitech" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Logitech (97)</label>
              </li>
              <li className="flex items-center">
                <input id="sony" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="sony" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Sony (234)</label>
              </li>
              <li className="flex items-center">
                <input id="asus" type="checkbox" value="" checked className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="asus" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Asus (97)</label>
              </li>
              <li className="flex items-center">
                <input id="dell" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="dell" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Dell (56)</label>
              </li>
              <li className="flex items-center">
                <input id="msi" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="msi" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">MSI (97)</label>
              </li>
              <li className="flex items-center">
                <input id="canon" type="checkbox" value="" checked className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="canon" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Canon (49)</label>
              </li>
              <li className="flex items-center">
                <input id="benq" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="benq" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">BenQ (23)</label>
              </li>
              <li className="flex items-center">
                <input id="razor" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="razor" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Razor (49)</label>
              </li>
              <a href="#" className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline">View all</a>
            </ul>
          </div>
        </div>

        <h2 id="price-heading">
          <button type="button" className="flex items-center justify-between w-full py-2 px-1.5 text-sm font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" data-accordion-target="#price-body" aria-expanded="true" aria-controls="price-body">
            <span>Price</span>
            <svg aria-hidden="true" data-accordion-icon="" className="w-5 h-5 rotate-180 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>
        </h2>
        <div id="price-body" className="hidden" aria-labelledby="price-heading">
          <div className="flex items-center py-2 space-x-3 font-light border-b border-gray-200 dark:border-gray-600"><select id="price-from" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"><option>From</option><option>$500</option><option>$2500</option><option>$5000</option></select><select id="price-to" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"><option>To</option><option>$500</option><option>$2500</option><option>$5000</option></select></div>
        </div>
      </div>
    </div>
  )
}

function SearchAndFilterRow({refetch}: any) {
  const { user } = useAuth()
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

  const notify = (msg: string) => toast(msg);

  const toggleProductModal = () => {
    console.log("openening ")
    setProductModalOpen((prev) => !prev);
  };

  const toggleCategoryModal = () => {
    setCategoryModalOpen((prev) => !prev);
  };
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center3 space-y-3 md:space-y-0 justify-between mx-4 py-4 border-t dark:border-gray-700">
      
      
      <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
        {user.role === "Product Manager" ? <>
          <button onClick={toggleProductModal} type="button" id="createProductButton" className="flex items-center justify-center text-white bg-sky-500 hover:bg-sky-600 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
            <svg className="h-3.5 w-3.5 mr-1.5 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path clip-rule="evenodd" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Add product
          </button>
        </> : null}
        
      </div>
      {/* Modals */}
      {isProductModalOpen && (
        <CreateProductModal onClose={() => setProductModalOpen(false)} refetch={refetch} notify={notify} />
      )}
      {/* {isCategoryModalOpen && (
        <CreateCategoryModal onClose={toggleCategoryModal} />
      )} */}
    </div>
  )
}

function ProductTable({ products, refetch }: { products: Product[], refetch: any }) {
  const { user } = useAuth()
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="p-4">Product</th>
            <th scope="col" className="p-4">Category</th>
            <th scope="col" className="p-4">Cost</th>
            <th scope="col" className="p-4">Price</th>
            <th scope="col" className="p-4 text-center">Discount Rate</th>
            <th scope="col" className="p-4 text-center">
              {user.role === "Product Manager" ? "Stock" : "Discounted Price"}
            </th>
            <th scope="col" className="p-4 text-center">Actions</th>

          </tr>
        </thead>
        <tbody>
          {
            products.map((product) => <ProductRow product={product} userRole={user.role} refetch={refetch} />)
          }
        </tbody>
      </table>
    </div>
  )
}

function ProductRow({ product, userRole, refetch }: { product: Product, userRole: string, refetch: any }) {
  const [discountRate, setDiscountRate] = useState(product.discounted_price ? ((product.price - product.discounted_price) / product.price * 100).toString() : "0")
  const [quantity, setQuantity] = useState(product.quantity_in_stock)
  const [price, setPrice] = useState(product.price.toString())

  const { mutate: updateDiscountRateMutation } = useMutation({
    mutationFn: ({
      productId,
      rate,
    }: {
      productId: number;
      rate: string;
    }) => {
      const result = updateDiscountRate(productId, parseFloat(rate) / 100);
      return result; // Ensure the return value is passed to ⁠ onSuccess ⁠
    },
    onSuccess: (data: any) => {
      refetch()
      alert(data.message)
    },
  });

  const { mutate: updateStockMutation } = useMutation({
    mutationFn: ({
      productId,
      stock,
    }: {
      productId: number;
      stock: number;
    }) => {
      const result = updateStock(productId, stock);
      return result; // Ensure the return value is passed to ⁠ onSuccess ⁠
    },
    onSuccess: (data: any) => {
      refetch()
      alert(data.message)
    },
  });

  const { mutate: updatePriceMutation } = useMutation({
    mutationFn: ({
      productId,
      price,
    }: {
      productId: number;
      price: string;
    }) => {
      const result = updatePrice(productId, parseFloat(parseFloat(price).toFixed(2)));
      return result; // Ensure the return value is passed to ⁠ onSuccess ⁠
    },
    onSuccess: (data: any) => {
      refetch()
      alert(data.message)
    },
  });

  const { mutate: deleteProductMutation } = useMutation({
    mutationFn: ({
      productId
    }: {
      productId: number;
    }) => {
      const result = deleteProductFromDatabase(productId);
      return result; // Ensure the return value is passed to ⁠ onSuccess ⁠
    },
    onSuccess: (data: any) => {
      refetch()
      toast.success(data.message)
    },
  });

  function handleEdit() {
    if (userRole === "Product Manager") {
      updateStockMutation({ productId: product.product_id, stock: quantity })
    } else if (userRole === "Sales Manager") {
      updateDiscountRateMutation({ productId: product.product_id, rate: discountRate })
    }
  }

  function handleUpdate() {
    updatePriceMutation({ productId: product.product_id, price })
  }

  function handleDelete() {
    deleteProductMutation({productId: product.product_id})
  }

  return (
    <tr className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
      <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
        <div className="flex items-center">
          <img src={
            product.image_url ||
            (product.category === "Coffee"
              ? "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg"
              : product.category === "Coffee Machines"
                ? "https://assets.bonappetit.com/photos/61e755ce6b6fe523b0365397/16:9/w_1280,c_limit/20220112%20Best%20Coffee%20Maker%20LEDE.jpg"
                : product.category === "Drinks"
                  ? "https://assets.bonappetit.com/photos/620fc9f986a3bcc597572d1c/3:2/w_6507,h_4338,c_limit/20220215%20Coffee%20Alternatives%20LEDE.jpg"
                  : product.category === "Accessories"
                    ? "https://img.freepik.com/free-photo/still-life-coffee-tools_23-2149371282.jpg"
                    : "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg")
          } className="h-8 w-auto mr-3" alt="Product" />
          {product.name}
        </div>
      </th>
      <td className="px-4 py-3">
        <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">{product.category}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          ${product.cost ?? 0}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          {userRole === "Sales Manager" ? (
            <div className="flex items-center">
              <span>$</span>
              <input
                type="text"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="w-20 text-xs p-1 ml-1"
              />
            </div>
          ) : (
            `$${product.price}`
          )}
        </div>

      </td>
      <td className="px-4 py-3">
        {userRole === "Sales Manager" ?
          <input type="text" value={discountRate} onChange={(event) => setDiscountRate(event.target.value)} className="w-20 text-xs p-1" /> :
          <span>{parseFloat(discountRate).toFixed(2)}%</span>
        }
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          {userRole === "Product Manager" ?
            <>
              <div className={`h-4 w-4 rounded-full mr-2 ${product.quantity_in_stock < 20 ? "bg-red-700" : product.quantity_in_stock < 100 ? "bg-yellow-300" : "bg-green-400"}`}></div>
              <input type="number" value={quantity} onChange={(event) => setQuantity(parseInt(event.target.value, 10))} className="w-20 text-xs p-1" />
            </> :
            <span
              className={product.discounted_price ? "text-green-500" : "text-red-500"}>
              {product.discounted_price ? `$${product.discounted_price.toFixed(2)}` : "-"}
            </span>

          }
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-4">
          {userRole === "Product Manager" ?
            <>
              <button type="button" data-drawer-target="drawer-update-product" data-drawer-show="drawer-update-product" aria-controls="drawer-update-product" className="py-2 px-3 flex items-center text-sm font-medium text-center text-white bg-slate-500 rounded-lg hover:bg-black" onClick={handleEdit}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 -ml-0.5" viewBox="0 0 20 20" fill="white" aria-hidden="true">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                </svg>
                Save Stock
              </button>
              <button type="button" className="flex items-center text-red-700 hover:text-white border border-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-2 text-center" onClick={handleDelete}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 -ml-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Delete
              </button>
            </> :
            <div className="flex gap-2">
              <button type="button"className="py-2 px-3 flex items-center text-sm font-medium text-center text-white bg-slate-500 rounded-lg hover:bg-black" onClick={handleUpdate}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 -ml-0.5" viewBox="0 0 20 20" fill="white" aria-hidden="true">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                </svg>
                Save Price
              </button>
              <button type="button" className="py-2 px-3 flex items-center text-sm font-medium text-center text-white bg-slate-500 rounded-lg hover:bg-black" onClick={handleEdit}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 -ml-0.5" viewBox="0 0 20 20" fill="white" aria-hidden="true">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                </svg>
                Save New Discount Rate
              </button>
            </div>
          }
        </div>
      </td>
    </tr>

  )

}
function CreateProductModal({ onClose, refetch, notify }: { onClose: () => void, refetch: any, notify: any }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model: '',
    serial_number: '',
    price: '',
    discounted_price: '',
    quantity_in_stock: '',
    warranty_status: '',
    distributor_info: '',
    origin: '',
    roast_level: '',
    power_usage: '',
    category: '',
    cost: ''
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const { mutate: addProduct } = useMutation({
    mutationFn: (newProduct: typeof formData) => {
      // use function from requests
      return addProductToDatabase(newProduct);
    },
    onSuccess: (response) => {
      if (response.error) {
        // Show error message to the user
        console.error("Error adding product:", response.error);
        notify(`Failed to add product: ${response.error}`);
        return;
      }

      refetch()
      notify("Product added successfully!");
      onClose();
    },
    onError: (error) => {
      // Handle error (e.g., show error notification)
      console.error('Error adding product:', error);
    }
  });

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    addProduct(formData)
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative p-4 w-full max-w-2xl bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
          <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Product
            </h3>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-toggle="createProductModal"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 mb-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.name}
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.description}
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.category}
                />
              </div>
              <div>
                <label
                  htmlFor="model"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  id="model"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.model}
                />
              </div>
              <div>
                <label
                  htmlFor="serial_number"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="serial_number"
                  id="serial_number"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.serial_number}
                />
              </div>
              <div>
                <label
                  htmlFor="cost"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Cost <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cost"
                  id="cost"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.cost}
                />
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  id="price"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.price}
                />
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Discounted Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="discounted_price"
                  id="discounted_price"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  onChange={handleChange}
                  value={formData.discounted_price}
                />
              </div>
              <div>
                <label
                  htmlFor="quantity_in_stock"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Quantity in Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity_in_stock"
                  id="quantity_in_stock"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.quantity_in_stock}
                />
              </div>
              <div>
                <label
                  htmlFor="distributor_info"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Distributor Info <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="distributor_info"
                  id="distributor_info"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.distributor_info}
                />
              </div>

              {/* Optional Fields */}
              <div>
                <label
                  htmlFor="warranty_status"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Warranty Status
                </label>
                <input
                  type="text"
                  name="warranty_status"
                  id="warranty_status"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  onChange={handleChange}
                  value={formData.warranty_status}
                />
              </div>
              <div>
                <label
                  htmlFor="origin"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Origin
                </label>
                <input
                  type="text"
                  name="origin"
                  id="origin"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  onChange={handleChange}
                  value={formData.origin}
                />
              </div>
              <div>
                <label
                  htmlFor="roast_level"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Roast Level
                </label>
                <input
                  type="text"
                  name="roast_level"
                  id="roast_level"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  onChange={handleChange}
                  value={formData.roast_level}
                />
              </div>
              <div>
                <label
                  htmlFor="power_usage"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Power Usage
                </label>
                <input
                  type="text"
                  name="power_usage"
                  id="power_usage"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  onChange={handleChange}
                  value={formData.power_usage}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="flex items-center text-green-600 hover:text-white border border-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-2 text-center"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


export default ProductManagementPage;