import { Field } from "formik"

export default function Checkbox ({
    name,
    text,
    defaultValue
} : {
    name: string
    text: JSX.Element
    defaultValue?: boolean
}) {
    return (
        <div className="flex gap-1">
            <Field
                type="checkbox"
                name={name}
                defaultValue={defaultValue}
            />
            {text}
        </div>
    )
}