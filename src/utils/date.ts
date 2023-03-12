export const dateFormat = (date: Date | string, format: Intl.DateTimeFormatOptions) => {
    if (typeof date === "string")
        date = new Date(date);
    
    return date ? date.toLocaleDateString("en-US", format) : null;
}