export default function NotFound ({
    item = "user"
} : {
    item?: string
}) {
    return (
        <div className="error error-not-found">
            <p>{item.charAt(0).toUpperCase() + item.slice(1)} not found. Please check the URL.</p>
        </div>
    );
}