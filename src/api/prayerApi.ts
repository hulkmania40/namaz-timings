const BASE = "https://api.aladhan.com/v1";

type AladhanResponse<T> = {
    code: number;
    status: string;
    data: T;
};

/**
 * Helper to build query string and fetch from Aladhan.
 */
async function fetchAladhan<T = any>(path: string, params: Record<string, string | number | undefined> = {}) {
    const qs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&");
    const url = `${BASE}${path}${qs ? "?" + qs : ""}`;
    const res = await fetch(url);
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Aladhan API error ${res.status}: ${txt}`);
    }
    const json = (await res.json()) as AladhanResponse<T>;
    if (json.code !== 200) throw new Error(`Aladhan responded with code ${json.code}: ${json.status}`);
    return json.data;
}

/**
 * Get prayer timings for coordinates.
 * method is optional Aladhan calculation method id (e.g. 2 for ISNA). 
 * date can be YYYY-MM-DD or timestamp (string/number) depending on use; Aladhan will accept date query.
 */
export async function getTimingsByCoordinates(
    latitude: number,
    longitude: number,
    opts?: { method?: number; date?: string | number; school?: number }
) {
    return fetchAladhan("/timings", {
        latitude,
        longitude,
        method: opts?.method,
        date: opts?.date,
        school: opts?.school,
    });
}

/**
 * Get prayer timings by city + country.
 * method optional.
 */
export async function getTimingsByCity(
    city: string,
    country: string,
    opts?: { method?: number; school?: number }
) {
    return fetchAladhan("/timingsByCity", {
        city,
        country,
        method: opts?.method,
        school: opts?.school,
    });
}

/**
 * Get prayer timings by address string.
 */
export async function getTimingsByAddress(address: string, opts?: { method?: number; school?: number }) {
    return fetchAladhan("/timingsByAddress", {
        address,
        method: opts?.method,
        school: opts?.school,
    });
}

/**
 * Get monthly calendar for coordinates.
 * month: 1-12, year: full year (e.g. 2025)
 */
export async function getCalendarByCoordinates(
    latitude: number,
    longitude: number,
    month: number,
    year: number,
    opts?: { method?: number; school?: number }
) {
    return fetchAladhan("/calendar", {
        latitude,
        longitude,
        month,
        year,
        method: opts?.method,
        school: opts?.school,
    });
}

/**
 * Get monthly calendar by city.
 */
export async function getCalendarByCity(
    city: string,
    country: string,
    month: number,
    year: number,
    opts?: { method?: number; school?: number }
) {
    return fetchAladhan("/calendarByCity", {
        city,
        country,
        month,
        year,
        method: opts?.method,
        school: opts?.school,
    });
}