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