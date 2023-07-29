const Purchase: React.FC<{
    classes?: string[]
}> = ({
    classes
}) => {
    return (
        <svg className={classes?.join(" ") ?? ""} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-8-8zM7 9a2 2 0 1 1 .001-4.001A2 2 0 0 1 7 9z" />
        </svg>
    );
}

export default Purchase;