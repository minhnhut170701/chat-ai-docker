import type { SvelteComponent } from "svelte";
import { push } from "svelte-spa-router";
import wrap from "svelte-spa-router/wrap";
import config from "~/configs/config";
import AccessTokenService from "~/services/accessToken.service";
import { userSlice } from "~/store/userSlice";

let userSliceValue = "";

// Subscribe to the store and update the local variable whenever the store's value changes
userSlice.subscribe((value) => {
  userSliceValue = value._id;
});

const authService = new AccessTokenService();

const { routesConfig } = config;

function privateRoute(component: typeof SvelteComponent) {
  return wrap({
    component,
    conditions: [
      () => {
        const tokenExists = authService.get();
        if (!userSliceValue && tokenExists) {
          authService.remove();
          push(routesConfig.loginPage);
          return false;
        }
        if (!tokenExists) {
          push(routesConfig.loginPage);
          return false;
        }
        return true;
      },
    ],
  });
}

export default privateRoute;
