// Define a generic type for the Formik form props
export type FormikFormProps<T> = {
  form: {
    values: T;
    handleSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
    setValues: (values: T, shouldValidate?: boolean) => void;
  };
  children: React.ReactNode;
  submitBtn: JSX.Element;
  type?: string;
};