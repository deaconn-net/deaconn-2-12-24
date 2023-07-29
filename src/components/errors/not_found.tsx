const NotFound: React.FC<{
    item?: string
}> = ({
    item = "User"
}) => {
    return (
        <div>
            <p>{item} not found. Please check the URL.</p>
        </div>
    );
}

export default NotFound;