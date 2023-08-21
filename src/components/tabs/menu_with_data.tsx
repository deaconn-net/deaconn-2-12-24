const TabsMenuWithData: React.FC<{
    menu: JSX.Element,
    data: JSX.Element,
    data_background?: boolean
}> = ({
    menu,
    data,
    data_background
}) => {
    return (
        <div className="tab-menu-with-data">
            <div>
                {menu}
            </div>
            <div className={data_background ? "bg-gray-800" : ""}>
                {data}
            </div>
        </div>
    );
}

export default TabsMenuWithData;