export default function NotFound ({
    item = "user"
} : {
    item?: string
}) {
    const itemName = item.charAt(0).toUpperCase() + item.slice(1);
    return (
        <div className="content-item2">
            <div>
                <h2>{itemName} Not Found</h2>
            </div>
            <div>
                <p>{itemName} not found. Please check the URL.</p>
            </div>
        </div>
    );
}