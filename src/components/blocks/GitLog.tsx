import GitLogBox from "@components/log/GitLogBox";

export default function GitLogBlock () {
    return (
        <div className="content-item2">
            <div>
                <h2>Git Log</h2>
            </div>
            <div>
                <GitLogBox />
            </div>
        </div>
    );
}