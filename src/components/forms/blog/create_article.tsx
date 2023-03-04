import { Field, useFormik } from 'formik';
import { useState } from 'react';
import { api } from '../../../utils/api';
import { FormMain } from '../main';

export const CreateArticle: React.FC<{ lookupId?: number, lookupUrl?: string }> = ({ lookupId, lookupUrl }) => {
    // Retrieve article if any.
    const query = api.blog.get.useQuery({
        id: lookupId ?? null,
        url: lookupUrl ?? null,

        selViews: false
    });
    const article = query.data;

    // Default values.
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [content, setContent] = useState("");

    if (article) {
        setUrl(article.url);
        setTitle(article.title);

        if (article.desc)
            setDesc(article.desc);

        setContent(article.content);
    }

    // Setup banner image.
    const [banner, setBanner] = useState<File | null>(null);

    // Setup form.
    const form = useFormik({
        initialValues: {
            url: url,
            title: title,
            desc: desc,
            content: content
        },
        enableReinitialize: true,

        onSubmit: (values) => {
            console.log("Values");
            console.log(values);

            console.log("Banner");
            console.log(banner);
        }
    });

    return (
        <FormMain
            form={form}
            content={<Fields 
                setBanner={setBanner}
            />}
            submitBtn={<Button />}
        />
    );
}

const Fields: React.FC<{ setBanner: React.Dispatch<React.SetStateAction<File | null>> }> = ({ setBanner }) => {
    return (
        <>
            <div className="form-div">
                <label className="form-label">Banner</label>
                <input type="file" name="banner" onChange={(e) => {
                    const val = (e?.currentTarget?.files) ? e.currentTarget.files[0] : null;

                    setBanner(val ?? null);
                }} className="text-gray-300" />
            </div>
            <div className="form-div">
                <label className="form-label">URL</label>
                <Field name="url" className="form-input" />
            </div>
            <div className="form-div">
                <label className="form-label">Title</label>
                <Field name="title" className="form-input" />
            </div>
            <div className="form-div">
                <label className="form-label">Description</label>
                <Field as="textarea" rows="8" cols="32" name="desc" className="form-input" />
            </div>
            <div className="form-div">
                <label className="form-label">Content</label>
                <Field as="textarea" rows="16" cols="32" name="content" className="form-input" />
            </div>
        </>
    )
}

const Button: React.FC<{ isEdit?: boolean }> = ({ isEdit=false }) => {
    return (
        <div className="text-center">
            <button type="submit" className="p-6 text-white text-center bg-cyan-900 rounded">{isEdit ? "Edit Article" : "Add Article"}</button>
        </div>
    )
}