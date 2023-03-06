export const getContents = (file: File) => {
    const reader = new FileReader();
  
    return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();

        reject(new DOMException("Problem parsing input file."));
      };
  
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    });
  };