const TWITTER_URL = "twitter.com";
const GITHUB_URL = "github.com";
const LINKEDIN_URL = "linkedin.com";
const FACEBOOK_URL = "facebook.com";

export function FormatSocialUrl(
    tag: string,
    platform: string
): string {
    let ret = tag;

    switch (platform.toLowerCase()) {
        case "twitter":
            ret = `https://${TWITTER_URL}/${tag}`

            break;

        case "github":
            ret = `https://${GITHUB_URL}/${tag}`

            break;

        case "linkedin":
            ret = `https://${LINKEDIN_URL}/in/${tag}`

            break;

        case "facebook":
            ret = `https://${FACEBOOK_URL}/${tag}`

            break;

        // Website, a special case.
        case "website":
            // See if we need to prepend protocol.
            if (!ret.includes("https://") && !ret.includes("http://"))
                ret = `https://${ret}`;

            break;
    }

    return ret;
}

export function RetrieveSocialTag(
    input: string,
    platform: string
): string | undefined {
    let tag: string | undefined = undefined;

    if (input.length < 1)
        return tag;

    tag = input;

    // Strip out protocols.
    tag = tag.replaceAll("https://", "");
    tag = tag.replaceAll("http://", "");

    // Replace double slashes with one just in-case.
    tag = tag.replaceAll("//", "/");

    // Now strip out URLs based off of platform parameter.
    switch (platform.toLowerCase()) {
        case "twitter":
            tag = tag.replaceAll(`www.${TWITTER_URL}/`, ``);
            tag = tag.replaceAll(`${TWITTER_URL}/`, ``);

            break;

        case "github":
            tag = tag.replaceAll(`www.${GITHUB_URL}/`, ``);
            tag = tag.replaceAll(`${GITHUB_URL}/`, ``);

            break;

        case "linkedin":
            tag = tag.replaceAll(`www.${LINKEDIN_URL}/in/`, ``);
            tag = tag.replaceAll(`${LINKEDIN_URL}/in/`, ``);

            break;

        case "facebook":
            tag = tag.replaceAll(`www.${FACEBOOK_URL}/`, ``);
            tag = tag.replaceAll(`${FACEBOOK_URL}/`, ``);

            break;
    }

    // When all said and done, remove other symbols.
    tag = tag.replaceAll("@", "");
    tag = tag.replaceAll("/", "");

    return tag;
}
