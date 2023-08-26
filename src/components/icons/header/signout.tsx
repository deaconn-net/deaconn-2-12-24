export default function SignOutIcon ({
    classes
} : {
    classes?: string[]
}) {
    return (
        <svg className={classes?.join(" ") ?? ""} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4H11M3 12H14M14 12L11 15M14 12L11 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}