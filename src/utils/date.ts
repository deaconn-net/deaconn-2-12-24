export const dateFormatOne: Intl.DateTimeFormatOptions = {
    year: "2-digit", 
    month: "2-digit", 
    day: "2-digit", 
    hour: "2-digit", 
    minute: "2-digit",
    timeZoneName: "short"
};

export const dateFormatTwo: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit"
};

export const dateFormat = (date: Date | string, format: Intl.DateTimeFormatOptions) => {
    if (typeof date === "string")
        date = new Date(date);
    
    return date ? date.toLocaleDateString("en-US", format) : null;
}