const ErrorBox: React.FC<{
    title?: string,
    msg?: string
}> = ({
    title,
    msg
}) => {
    return (
        <>
            {title && msg && (
                <div className="p-6 bg-red-900 rounded">
                    <h3 className="text-white text-xl font-bold">{title}</h3>
                    <p className="text-gray-100">{msg}</p>
                </div>
            )}
        </>
    );
}

export default ErrorBox;