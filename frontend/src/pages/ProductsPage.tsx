import { ProductCard } from "@/components/cards/ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllProducts } from "@/lib/requests";
import { Product } from "@/types/product";

const CATEGORIES = [
  {
    value: "Coffee",
  },
  {
    value: "Coffee Machine",
  },
  {
    value: "Drinks",
  },
  {
    value: "Accessories",
  },
];

const SUB_CATEGORIES = [
  {
    value: "coffee-beans",
    subCategories: [
      {
        label: "All",
        value: "all-coffee-beans",
      },
      {
        label: "Espresso Beans",
        value: "espresso-beans",
      },
      {
        label: "French Roast",
        value: "french-roast",
      },
      {
        label: "House Blend",
        value: "house-blend",
      },
    ],
  },
  {
    value: "equipments",
    subCategories: [
      {
        label: "All",
        value: "all-equipments",
      },
      {
        label: "Espresso Machines",
        value: "espresso-machines",
      },
      {
        label: "Grinders",
        value: "grinders",
      },
      {
        label: "French Press",
        value: "french-press",
      },
      {
        label: "Pour Over",
        value: "pour-over",
      },
    ],
  },
  {
    value: "drinks",
    subCategories: [
      {
        label: "All",
        value: "all-drinks",
      },
      {
        label: "Cold Brew",
        value: "cold-brew",
      },
      {
        label: "Iced Coffee",
        value: "iced-coffee",
      },
      {
        label: "Iced Latte",
        value: "iced-latte",
      },
    ],
  },
  {
    value: "accessories",
    subCategories: [
      {
        label: "All",
        value: "all-accessories",
      },
      {
        label: "Coffee Cups",
        value: "coffee-cups",
      },
      {
        label: "Coffee Filters",
        value: "coffee-filters",
      },
      {
        label: "Vacuum Bottles",
        value: "vacuum-bottles",
      },
    ],
  },
];

const ProductPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
  });

  console.log(products);

  const [category, setCategory] = useState(
    searchParams.get("category") || "coffee-beans"
  );
  const [subCategory, setSubCategory] = useState(
    searchParams.get("subCategory") || "all-coffee-beans"
  );
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const filteredData = products?.products.filter((product: Product) => {
      const matchesSearch =
        search === "" ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.model.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === product.category;
      // const matchesSubCategory =
      //   subCategory.includes("all") || subCategory === product.subCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredProducts(filteredData);
  }, [category, subCategory, search, products]);

  return (
    <div className="w-full h-full bg-amber-50 pt-8">
      <div className="w-full px-4 py-2 border-t border-b border-gray-200 bg-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select
            onValueChange={(value) => {
              setCategory(value);
              const subCategory = SUB_CATEGORIES.find(
                (sub) => sub.value === value
              )?.subCategories[0].value;
              setSubCategory(subCategory || "");

              // UPDATE URL
              navigate(
                `/products?category=${value}&subCategory=${subCategory}`
              );
            }}
            value={category}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              setSubCategory(value);
              navigate(`/products?category=${category}&subCategory=${value}`);
            }}
            value={subCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sub Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sub Category</SelectLabel>
                {SUB_CATEGORIES.find(
                  (sub) => sub.value === category
                )?.subCategories.map((sub) => (
                  <SelectItem key={sub.value} value={sub.value}>
                    {sub.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            type="search"
            placeholder="Search"
            className="w-[180px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="w-full px-4 py-2 mt-4">
        <h1 className="text-2xl font-bold">Products</h1>
      </div>
      <div className="w-full px-4 py-2 mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          filteredProducts?.map((product: Product) => (
            <ProductCard key={product.product_id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductPage;
