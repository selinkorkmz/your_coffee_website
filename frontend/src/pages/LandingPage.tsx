import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { PiCoffeeBeanFill } from "react-icons/pi";
import { GiCoffeePot } from "react-icons/gi";
import { CiCoffeeCup } from "react-icons/ci";
import { TbBowlSpoonFilled } from "react-icons/tb";

const CATEGORIES = [
  {
    name: "Coffee Beans",
    icon: <PiCoffeeBeanFill size={64} />,
    to: "/products?category=Coffee",
  },
  {
    name: "Equipments",
    icon: <GiCoffeePot size={64} />,
    to: "/products?category=Coffee Machines",
  },
  {
    name: " Other Drinks",
    icon: <CiCoffeeCup size={64} />,
    to: "/products?category=Drinks",
  },
  {
    name: "Accessories",
    icon: <TbBowlSpoonFilled size={64} />,
    to: "/products?category=Accessories",
  },
];
const IMAGES = [
  "https://www.nescafe.com/au/sites/default/files/2024-04/Untitled-5%20copy_6_0.jpg",
  "https://www.italyweloveyou.com/wp-content/uploads/2022/06/De-Longhi-Coffe-Machine.webp",
  "https://img.freepik.com/free-vector/coffee-paper-takeaway-cup-top-view_107791-31000.jpg",
  "https://www.sciencealert.com/images/2023/09/GroundCoffeeOnBeans.jpg",
];

const LandingPage = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    console.log(api);
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    // Enable autoplay
    const autoplayInterval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Change slide every 3 seconds

    return () => {
      clearInterval(autoplayInterval);
    };
  }, [api]);

  return (
    <div className="w-full h-full bg-amber-50">
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent className="-ml-1 px-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CarouselItem key={index} className="pl-1 basis-full">
              <div className="p-1 h-[450px]">
                <Card className="w-full h-full">
                  <CardContent className="flex items-center justify-center p-2 h-full">
                    <img
                      src={IMAGES[index]}
                      alt="product"
                      className="w-full h-full object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="py-2 text-center">
        {Array.from({ length: 4 }).map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`w-2 h-2 rounded-full mx-1 border border-gray-300 ${
              current === index ? "bg-primary" : "bg-muted"
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
      <div className="flex flex-col px-32 mt-4">
        <div className="grid grid-cols-4 gap-4 h-32">
          {CATEGORIES.map((category) => (
            <Link to={category.to}>
              <Card key={category.name}>
                <CardHeader className="text-center">
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  {category.icon}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
