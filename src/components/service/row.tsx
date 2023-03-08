import { Service } from "@prisma/client";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import { api } from "~/utils/api";
import { ArticleForm } from "../forms/article/new";
import { SuccessBox } from "../utils/success";

export const ServiceRow: React.FC<{ service: Service, cdn: string, small?: boolean }> = ({ service , cdn, small=false }) => {
    const viewUrl = "/service/view/" + service.url;
    const editUrl = "/service/new?id=" + service.id;

    const banner = (service.banner) ? cdn + service.banner : "/images/service/default.jpg";

    const deleteMut = api.service.delete.useMutation();
  
    return (
      <>
        {deleteMut.isSuccess ? (
          <SuccessBox
            title={"Successfully Deleted!"}
            msg={"Successfully deleted service ID #" + service.id + "."}
          />
        ) : (
          <div className={"service-row " + ((small) ? "service-row-sm" : "service-row-lg")}>
            <div className={"w-full " + ((small) ? "h-48" : "h-72")}>
              <img src={banner} className="w-full h-full max-h-full" />
            </div>
            <div className="">
              <h3 className="text-white text-2xl font-bold text-center">{service.name}</h3>
            </div>
            <div className="pb-6 grow">
                <ReactMarkdown
                    className="markdown"
                >
                    {service.desc ?? ""}
                </ReactMarkdown>
            </div>
            <div className="pb-6 flex justify-center">
                <p className="text-xl text-green-300 font-bold italic">{(service.price > 0) ? "$" + service.price + "/m" : "Free"}</p>
            </div>
            <div className="pb-6 flex justify-between text-white text-sm">
              <div className="flex flex-wrap items-center">
                <span><svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9ZM11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12Z" /><path fillRule="evenodd" clipRule="evenodd" d="M21.83 11.2807C19.542 7.15186 15.8122 5 12 5C8.18777 5 4.45796 7.15186 2.17003 11.2807C1.94637 11.6844 1.94361 12.1821 2.16029 12.5876C4.41183 16.8013 8.1628 19 12 19C15.8372 19 19.5882 16.8013 21.8397 12.5876C22.0564 12.1821 22.0536 11.6844 21.83 11.2807ZM12 17C9.06097 17 6.04052 15.3724 4.09173 11.9487C6.06862 8.59614 9.07319 7 12 7C14.9268 7 17.9314 8.59614 19.9083 11.9487C17.9595 15.3724 14.939 17 12 17Z" /></svg></span>
                <span className="ml-1">{service.views}</span>
              </div>
              <div className="flex flex-wrap items-center">
                <span><svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M9.163 2.819C9 3.139 9 3.559 9 4.4V11H7.803c-.883 0-1.325 0-1.534.176a.75.75 0 0 0-.266.62c.017.274.322.593.931 1.232l4.198 4.401c.302.318.453.476.63.535a.749.749 0 0 0 .476 0c.177-.059.328-.217.63-.535l4.198-4.4c.61-.64.914-.96.93-1.233a.75.75 0 0 0-.265-.62C17.522 11 17.081 11 16.197 11H15V4.4c0-.84 0-1.26-.164-1.581a1.5 1.5 0 0 0-.655-.656C13.861 2 13.441 2 12.6 2h-1.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656zM5 21a1 1 0 0 0 1 1h12a1 1 0 1 0 0-2H6a1 1 0 0 0-1 1z" /></svg></span>
                <span className="ml-1">{service.downloads}</span>
              </div>
              <div className="flex flex-wrap items-center">
                <span><svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-8-8zM7 9a2 2 0 1 1 .001-4.001A2 2 0 0 1 7 9z"/></svg></span>
                <span className="ml-1">{service.purchases}</span>
              </div>
            </div>
            <div className="p-6 flex flex-wrap gap-2 justify-center">
              <Link className="w-full button" href={viewUrl}>View</Link>
              {service.openSource && service.gitLink && (
                <a className="w-full button button-secondary" target="_blank" href={service.gitLink}>Source Code</a>
              )}
            </div>
            <div className="p-6 flex flex-wrap gap-2 justify-center">
                <Link className="w-full button button-secondary" href={editUrl}>Edit</Link>
                <Link className="w-full button button-delete" href="#" onClick={(e) => {
                e.preventDefault();
    
                const yes = confirm("Are you sure you want to delete this service?");
    
                if (yes) {
                  deleteMut.mutate({
                    id: service.id
                  });
                }
              }}>Delete</Link> 

            </div>
          </div>
        )}
      </>

    )
  }