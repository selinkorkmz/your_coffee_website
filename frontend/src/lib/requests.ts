const API_URL = "http://localhost:3000/api";

export async function loginRequest(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseBody = await response.json();

    console.log(responseBody, response.ok);

    if (!response.ok) {
      return {
        error: responseBody.message,
      };
    }

    return {
      success: true,
      user: responseBody.user,
      token: responseBody.token,
    };
  } catch (err) {
    console.log(err);
    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function registerRequest(name, email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        role: "Customer",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseBody = await response.json();

    console.log(responseBody, response.ok);

    if (!response.ok) {
      return {
        error: responseBody.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.log(err);
    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function fetchUserCart() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user ?? "{}");
  try {
    const response = await fetch(`${API_URL}/cart/${parsedUser.user_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const cartData = await response.json();

      return {
        success: true,
        cart: cartData.cart,
      };
    } else {
      console.error("Failed to fetch user cart", response.statusText);
      return {
        error: "Failed to fetch user cart",
      };
    }
  } catch (err) {
    console.error("Error fetching cart:", err);

    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function addProductToCart(productId: number, quantity: number) {
  console.log(productId, quantity);
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user ?? "{}");
  console.log(parsedUser);

  try {
    const response = await fetch(
      `${API_URL}/cart/${parsedUser.user_id}/addProductToCart`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      }
    );

    if (response.ok) {
      const responseData = await response.json();

      return {
        success: true,
        message: responseData.message,
      };
    } else {
      console.error("Failed to add product to cart", response.statusText);
      return {
        error: "Failed to add product to cart",
      };
    }
  } catch (err) {
    console.error("Error adding product to cart:", err);

    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function fetchAllProducts() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/products/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const productData = await response.json();

      return {
        success: true,
        products: productData.products,
      };
    } else {
      console.error("Failed to fetch user cart", response.statusText);
      return {
        error: "Failed to fetch user cart",
      };
    }
  } catch (err) {
    console.error("Error fetching cart:", err);

    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function getProductById(id) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/products/getbyid/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const productData = await response.json();

      return {
        success: true,
        product: productData.product,
      };
    } else {
      console.error("Failed to fetch product by id", response.statusText);
      return {
        error: "Failed to fetch product by id",
      };
    }
  } catch (err) {
    console.error("Error fetching product by id:", err);

    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function fetchAllCategories() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/products/categories`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const productData = await response.json();

      return {
        success: true,
        categories: productData.categories,
      };
    } else {
      console.error("Failed to fetch user cart", response.statusText);
      return {
        error: "Failed to fetch user cart",
      };
    }
  } catch (err) {
    console.error("Error fetching cart:", err);

    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function removeProductFromCart(productId, quantity) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user ?? "{}");
  console.log(parsedUser);

  try {
    const response = await fetch(
      `${API_URL}/cart/${parsedUser.user_id}/removeProductFromCart`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      }
    );

    if (response.ok) {
      const responseData = await response.json();

      return {
        success: true,
        message: responseData.message,
      };
    } else {
      console.error("Failed to remove product from cart", response.statusText);
      return {
        error: "Failed to remove product from cart",
      };
    }
  } catch (err) {
    console.error("Error removing product from cart:", err);

    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function submitReview(
  productId: number,
  comment: string,
  rating: number
) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!user) {
    return {
      error: "Please login to submit a review",
    };
  }

  const userId = JSON.parse(user).user_id;

  try {
    await fetch(`${API_URL}/reviews/${productId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        comment,
        rating,
      }),
    });
  } catch (err) {
    console.error("Error submitting review:", err);
    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function getReviews(productId: number) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/reviews/${productId}/reviews`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const reviews = await response.json();
      return {
        success: true,
        reviews: reviews.reviews,
      };
    }
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function getPendingReviews() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/reviews/pending-reviews`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const reviews = await response.json();
      return {
        success: true,
        reviews: reviews.reviews,
      };
    }
  } catch (err) {
    console.error("Error fetching pending reviews:", err);
    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function moderateReview(reviewId: number, approved: number) {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${API_URL}/reviews/${reviewId}/moderate`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ approved }),
    });
  } catch (err) {
    console.error("Error moderating review:", err);
    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function initiatePayment() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!user) {
    return {
      error: "Please login to purchase your cart",
    };
  }

  try {
    const response = await fetch(`${API_URL}/payments/initiate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentMethod: "Card",
      }),
    });

    if (response.ok) {
      const orderId = await response.json();
      return {
        success: true,
        orderId: orderId.orderId,
      };
    }
  } catch (err) {
    console.error("Error initiating payment:", err);
    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function updateCartProduct(productId: number, quantity: number) {
  const response = await fetch(`/api/cart/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    throw new Error("Failed to update cart product");
  }

  return response.json();
}

export async function pay(cardDetails: { cvv: string, cardNumber: string, holderName: string, expire: string}, deliveryAddress: string) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!user) {
    return {
      error: "Please login to purchase your cart",
    };
  }

  try {
    const response = await fetch(`${API_URL}/payments/pay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardDetails,
        deliveryAddress
      }),
    });

    if (response.ok) {
      const result = await response.json();

      window.open(`http://localhost:3000/invoice/${result.invoiceFileName}`, '_blank')?.focus();

      return {
        success: true,
        message: result.message
      };
    }

    if(response.status === 400) {
      const result = await response.json();
      return {
        error: result.message
      }
    }

    return {
      error: "Unknown error"
    };
  } catch (err) {
    console.error("Error initiating payment:", err);
    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}

export async function getOrders() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if(!user){
    return {
      error: "Log in to see your orders."
    }
  }

  const userId = JSON.parse(user).user_id;

  try {
    const response = await fetch(`${API_URL}/orders/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        orders: result.orders,
      };
    }

    return {
      error: "unknown error"
    }
  } catch (err) {
    console.error("Error fetching orders:", err);
    return {
      error: (err as Error).message ?? "Unexpected error",
    };
  }
}