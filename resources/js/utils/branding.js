export function getRestaurantName(business) {
    return business?.name?.trim().replace(/\s+/g, ' ') || 'ISARO RESTAURANT';
}

export function restaurantPageTitle(title, restaurantName) {
    if (!title) return restaurantName;
    return title.includes(restaurantName) ? title : `${title} | ${restaurantName}`;
}
