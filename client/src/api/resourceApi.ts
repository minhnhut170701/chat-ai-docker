import axiosClient from "./axiosClient";
import type { AxiosRequestConfig } from "axios";

class ResourceApi<T> {
  public uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  public list(query: any): Promise<any> {
    const config: AxiosRequestConfig = {
      url: this.uri,
      method: "GET",
      params: query,
    };
    return axiosClient(config);
  }

  public all(): Promise<any> {
    const config: AxiosRequestConfig = {
      url: `${this.uri}/all`,
      method: "GET",
    };
    return axiosClient(config);
  }

  public get(id: string): Promise<any> {
    const config: AxiosRequestConfig = {
      url: `${this.uri}/edit/${id}`,
      method: "GET",
    };
    return axiosClient(config);
  }

  public store(resource: T): Promise<any> {
    const config: AxiosRequestConfig = {
      url: `${this.uri}/create`,
      method: "POST",
      data: resource,
    };
    return axiosClient(config);
  }

  public update(resource: T, id: string): Promise<any> {
    const config: AxiosRequestConfig = {
      url: `${this.uri}/edit/${id}`,
      method: "POST",
      data: resource,
    };
    return axiosClient(config);
  }

  public destroy(id: string): Promise<any> {
    const config: AxiosRequestConfig = {
      url: `${this.uri}/delete/${id}`,
      method: "DELETE",
    };
    return axiosClient(config);
  }

  public destroyMulti(resource: any): Promise<any> {
    const config: AxiosRequestConfig = {
      url: `${this.uri}`,
      method: "DELETE",
      params: resource,
    };
    return axiosClient(config);
  }

  public copy(resource: T, id: string): Promise<any> {
    const config: AxiosRequestConfig = {
      url: `${this.uri}/${id}`,
      method: "GET",
      data: resource,
    };
    return axiosClient(config);
  }
}

export default ResourceApi;
