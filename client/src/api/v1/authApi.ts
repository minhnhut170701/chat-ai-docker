import axiosClient from "../axiosClient";
import ResourceApi from "../resourceApi";

class AuthApi extends ResourceApi<any> {
  constructor() {
    super("/api/auth");
  }

  login(resource: any) {
    return axiosClient({
      url: `${this.uri}/login`,
      method: "POST",
      data: resource,
    });
  }

  register(resource: any) {
    return axiosClient({
      url: `${this.uri}/register`,
      method: "POST",
      data: resource,
    });
  }
}

export default AuthApi;
