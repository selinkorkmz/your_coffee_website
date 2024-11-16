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
    to: "/products?category=Coffee&subCategory=all-Coffee",
  },
  {
    name: "Equipments",
    icon: <GiCoffeePot size={64} />,
    to: "/products?category=Coffee Machine&subCategory=all-Coffee Machine",
  },
  {
    name: "Drinks",
    icon: <CiCoffeeCup size={64} />,
    to: "/products?category=drinks&subCategory=all-drinks",
  },
  {
    name: "Accessories",
    icon: <TbBowlSpoonFilled size={64} />,
    to: "/products?category=accessories&subCategory=all-accessories",
  },
];
const IMAGES = [
  "https://picsum.photos/1920/528?0",
  "https://picsum.photos/1920/528?1",
  "https://picsum.photos/1920/528?2",
  "https://picsum.photos/1920/528?3",
  "https://picsum.photos/1920/528?4",
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
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="pl-1 basis-full">
              <div className="p-1 h-[450px]">
                <Card className="w-full h-full">
                  <CardContent className="flex items-center justify-center p-6 h-full">
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
        {Array.from({ length: 5 }).map((_, index) => (
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
