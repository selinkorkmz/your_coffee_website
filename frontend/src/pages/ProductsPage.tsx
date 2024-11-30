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
import { fetchAllCategories, fetchAllProducts } from "@/lib/requests";
import { Product } from "@/types/product";

function getPriceDifference(productA: Product, productB: Product) {
  if (productA.discounted_price && productB.discounted_price) {
    return productA.discounted_price - productB.discounted_price;
  }
  if (productA.discounted_price) {
    return productA.discounted_price - productB.price;
  }
  if (productB.discounted_price) {
    return productA.price - productB.discounted_price;
  }
  return productA.price - productB.price;
}

const ProductPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
  });

  console.log(products);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchAllCategories,
  });

  const [category, setCategory] = useState(
    searchParams.get("category") || "Coffee"
  );

  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const filteredData = (products?.products ?? []).filter(
      (product: Product) => {
        const matchesSearch =
          search === "" ||
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.model.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = category === product.category;

        return matchesSearch && matchesCategory;
      }
    );

    if (sortBy === "price-asc") {
      filteredData.sort((a: Product, b: Product) => {
        return getPriceDifference(a, b);
      });
    } else if (sortBy === "price-desc") {
      filteredData.sort((a: Product, b: Product) => {
        return getPriceDifference(b, a);
      });
    } else if (sortBy === "rating-asc") {
      filteredData.sort((a: Product, b: Product) => {
        return a.rating - b.rating;
      });
    } else if (sortBy === "rating-desc") {
      filteredData.sort((a: Product, b: Product) => {
        return b.rating - a.rating;
      });
    }

    setFilteredProducts(filteredData);
  }, [category, search, products, sortBy]);

  return (
    <div className="w-full h-full bg-amber-50 pt-8">
      <div className="w-full px-4 py-2 border-t border-b border-gray-200 bg-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select
            onValueChange={(value) => {
              setCategory(value);

              // UPDATE URL
              navigate(`/products?category=${value}`);
            }}
            value={category}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                {(categories?.categories ?? []).map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating-asc">Rating: Low to High</SelectItem>
              <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
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
