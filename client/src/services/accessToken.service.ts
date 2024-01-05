import BaseStorage from "./base.service";
import config from "../configs/config";

class AccessTokenService extends BaseStorage {
  constructor() {
    super(`${config.appConfig.base_app_key}.auth.access_token`);
  }
}
export default AccessTokenService;
