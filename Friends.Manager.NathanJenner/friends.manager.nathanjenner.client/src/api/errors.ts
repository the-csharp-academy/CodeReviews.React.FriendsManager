export function errorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'status' in error) {
        const data = 'data' in error ? error.data : undefined;
        if (typeof data === 'object' && data !== null) {
            if ('errors' in data && typeof data.errors === 'object' && data.errors !== null) {
                const messages = Object.values(data.errors)
                    .flatMap(value => Array.isArray(value) ? value : [value])
                    .filter((value): value is string => typeof value === 'string');
                if (messages.length > 0)
                    return messages.join(' ');
            }
            if ('detail' in data && typeof data.detail === 'string')
                return data.detail;
            if ('title' in data && typeof data.title === 'string')
                return data.title;
        }
        if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR')
            return 'Cannot reach the server. Check your connection and try again.';
        if (error.status === 404)
            return 'This record no longer exists. Refresh and try again.';
    }
    return 'The request failed. Please try again.';
}
