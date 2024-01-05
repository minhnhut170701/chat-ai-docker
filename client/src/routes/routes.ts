import HomePage from "../pages/HomePage/HomePage.svelte";
import Authenticate from "../pages/Authenticate/Authenticate.svelte";
import config from "../configs/config";
import type { SvelteComponent } from "svelte";
import privateRoute from "~/middleware/PrivateRoute";
const { routesConfig } = config;

export default {
  [routesConfig.chatPage]: privateRoute(HomePage as typeof SvelteComponent),
  [routesConfig.signupPage]: Authenticate,
  [routesConfig.loginPage]: Authenticate,
  "*": Authenticate,
};
