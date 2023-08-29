export default function AddIcon ({
    className
} : {
    className?: string
}) {
    return (
        <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.1" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" className="fill-white" />
            <path d="M9 12H15" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9L12 15" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" className="stroke-white" strokeWidth="2" />
        </svg>
    );
}