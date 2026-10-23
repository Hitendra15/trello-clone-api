const API_BASE_URL = 'http://127.0.0.1:8000/api'

export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
        throw data
    }

    return data
}


export const loginUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
        throw data
    }

    return data
}


export const getDashboard = async (accessToken) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    })
    const data = await response.json()
    if (!response.ok) {
        throw {
            ...data,
            status: response.status,
        }
    }
    return data
}

export const getBoards = async (accessToken) => {
    const response = await fetch(`${API_BASE_URL}/boards/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    })

    const data = await response.json()

    if (!response.ok) {
        throw {
            ...data,
            status: response.status,
        }
    }

    return data
}

export const createBoard = async (boardData, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/boards/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(boardData),
    })

    const data = await response.json()

    if (!response.ok) {
        throw {
            ...data,
            status: response.status,
        }
    }

    return data
}


export const updateBoard = async (boardId, boardData, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(boardData),
    })

    const data = await response.json()

    if (!response.ok) {
        throw {
            ...data,
            status: response.status,
        }
    }

    return data
}

export const deleteBoard = async (boardId, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        let data = {}

        try {
            data = await response.json()
        } catch {
            data = {}
        }

        throw {
            ...data,
            status: response.status,
        }
    }

    return true
}