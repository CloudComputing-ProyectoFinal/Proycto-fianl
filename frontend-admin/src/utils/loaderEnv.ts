type resource = 'AUTH_URL' | 'WS_URL' | 'REPORTS_URL' | 'PLACE_URL'| 'STATS_URL'| 'USERS_URL' | 'ADMIN_URL' | 'INCIDENTS_URL' | 'DELIVERY_URL' | 'KITCHEN_URL' | 'ORDERS_URL';

const envMap: Record<resource, string> = {
    AUTH_URL: 'VITE_API_URL_AUTH',
    WS_URL: 'VITE_API_URL_WS',
    REPORTS_URL: 'VITE_API_URL_REPORTS',
    PLACE_URL: 'VITE_API_URL_PLACES',
    STATS_URL:'VITE_API_URL_STATS',
    USERS_URL: 'VITE_API_URL_USERS',
    ADMIN_URL: 'VITE_API_URL_ADMIN',
    INCIDENTS_URL: 'VITE_API_URL_INCIDENTS',
    DELIVERY_URL: 'VITE_API_URL_DELIVERY',
    KITCHEN_URL: 'VITE_API_URL_KITCHEN',
    ORDERS_URL: 'VITE_API_URL_ORDERS'
};

export function loadEnv(resource: resource): string {
    const envVar = envMap[resource];
    const value = import.meta.env[envVar];
    if (!value) {
        throw new Error(`Environment variable ${envVar} is not set`);
    }
    return value;
}