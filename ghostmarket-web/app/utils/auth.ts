/**
 * Auth utility functions for client-side authentication
 */

export function getAuthToken(): string | null {
    if (typeof document === 'undefined') return null;

    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('havenn_token='));

    return cookieValue ? cookieValue.split('=')[1] : null;
}

export function isAuthenticated(): boolean {
    return getAuthToken() !== null;
}

export function logout(): void {
    // Clear the token cookie
    document.cookie = 'havenn_token=; path=/; max-age=0';

    // Redirect to home
    window.location.href = '/';
}

export async function getCurrentUser() {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (res.ok) {
            return await res.json();
        }
        return null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}
