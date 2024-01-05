const AUTHENTICATE = {
  loginPage: "/login",
  signupPage: "/signup",
  infoPage: "/info",
};

const HOME_ROUTES = {
  chatPage: "/",
};

const routes = {
  ...HOME_ROUTES,
  ...AUTHENTICATE,
};

export default routes;
