export const isOwner = (
    itemId: string,
    userId: string
) => {
    return itemId == userId;
}