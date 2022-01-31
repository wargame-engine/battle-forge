import { getRandomItem } from 'utils/math';
import banners from 'assets/data/banners.json';
export function getRandomHeader() {
    return getRandomItem(banners);
}
export function getHeaders() {
    return banners;
}

