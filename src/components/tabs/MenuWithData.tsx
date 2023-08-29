export default function TabsMenuWithData ({
    menu,
    data,
    data_background
} : {
    menu: JSX.Element,
    data: JSX.Element,
    data_background?: boolean
}) {
    return (
        <div className="tab-menu-with-data">
            <div>
                {menu}
            </div>
            <div className={data_background ? "bg-gradient-to-b from-deaconn-data to-deaconn-data2" : ""}>
                {data}
            </div>
        </div>
    );
}