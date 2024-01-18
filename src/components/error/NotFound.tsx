export default function NotFound ({
    item = "page"
} : {
    item?: string
}) {
    return (
        <div className="content-item2">
            <div>
                <h2>{item.charAt(0).toUpperCase() + item.slice(1)} Not Found</h2>
            </div>
            <div>
                <p>The {item} you{"'"}re trying to view could not found. Please check the URL.</p>
                <p>If this is a mistake, please contact an administrator.</p>
            </div>
        </div>
    );
}