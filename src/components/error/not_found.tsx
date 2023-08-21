const NotFound: React.FC<{
    item?: string
}> = ({
    item = "User"
}) => {
    return (
        <div className="error error-not-found">
            <p>{item} not found. Please check the URL.</p>
        </div>
    );
}

export default NotFound;