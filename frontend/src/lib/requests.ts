const API_URL = "http://localhost:3000/api"

export async function loginRequest(email, password){
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
    
        const responseBody = await response.json();

        console.log(responseBody, response.ok)
    
        if (!response.ok) {
            return {
                error: responseBody.message
            }
        }

        return {
            success: true,
            user: responseBody.user,
            token: responseBody.token
        }
    } catch (err) {
        console.log(err)
        return {
            error: (err as Error).message ?? "Unexpected error"
        }
    }


}


export async function registerRequest(name, email, password){
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            body: JSON.stringify({
                name,
                email,
                password,
                role: "Customer"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
    
        const responseBody = await response.json();

        console.log(responseBody, response.ok)
    
        if (!response.ok) {
            return {
                error: responseBody.message
            }
        }

        return {
            success: true
        }
    } catch (err) {
        console.log(err)
        return {
            error: (err as Error).message ?? "Unexpected error"
        }
    }


}

export async function fetchUserCart() {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    const parsedUser = JSON.parse(user ?? "{}")
    try {
        const response = await fetch(`${API_URL}/cart/users/${parsedUser.user_id}/cart`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const cartData = await response.json();

            return {
                success: true,
                cart: cartData.cart
            }    

        } else {
            console.error("Failed to fetch user cart", response.statusText);
            return {
                error: "Failed to fetch user cart"
            }
        }
    } catch (err) {
        console.error("Error fetching cart:", err);

        return {
            error: (err as Error).message ?? "Unexpected error"
        }
    }
}

export async function addProductToCart(productId, quantity) {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const parsedUser = JSON.parse(user ?? "{}");
    console.log(parsedUser)

    try {
        const response = await fetch(`${API_URL}/cart/users/${parsedUser.user_id}/addProductToCart`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId,
                quantity
            })
        });

        if (response.ok) {
            const responseData = await response.json();

            return {
                success: true,
                message: responseData.message
            };
        } else {
            console.error("Failed to add product to cart", response.statusText);
            return {
                error: "Failed to add product to cart"
            };
        }
    } catch (err) {
        console.error("Error adding product to cart:", err);

        return {
            error: (err as Error).message ?? "Unexpected error"
        };
    }
}

export async function fetchAllProducts() {
    const token = localStorage.getItem("token")
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const productData = await response.json();

            return {
                success: true,
                products: productData.products
            }    

        } else {
            console.error("Failed to fetch user cart", response.statusText);
            return {
                error: "Failed to fetch user cart"
            }
        }
    } catch (err) {
        console.error("Error fetching cart:", err);

        return {
            error: (err as Error).message ?? "Unexpected error"
        }
    }
}