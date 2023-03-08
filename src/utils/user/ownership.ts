export const isOwner = <T extends { itemId: string, userId: string}> (itemId: T['itemId'], userId: T['userId']) => {
    return itemId == userId;
}