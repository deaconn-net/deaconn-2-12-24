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

export const dateFormatThree: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric"
};

export const dateFormatFour: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short"
};

export const dateFormatFive: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "2-digit"
}

export function dateFormat (
    date: Date | string,
    format: Intl.DateTimeFormatOptions
) {
    // For some strange reason, Prisma DB returns dates as strings at times.
    // Therefore, check if it is a string and if so, parse as a date.
    if (typeof date === "string")
        date = new Date(date);

    return date?.toLocaleDateString("en-US", format) ?? null;
}

export function dateToYMD(date: Date | string): string {
    if (typeof date === "string")
        date = new Date(date);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`
}