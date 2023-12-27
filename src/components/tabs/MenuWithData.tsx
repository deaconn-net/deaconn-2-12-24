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
        <div className="flex flex-wrap gap-4 justify-center">
            <div className="w-96 sm:w-auto flex justify-center">
                {menu}
            </div>
            <div className={`w-full sm:w-auto grow flex flex-col gap-4 ${data_background ? "bg-gradient-to-b from-deaconn-data to-deaconn-data2" : ""}`}>
                {data}
            </div>
        </div>
    );
}