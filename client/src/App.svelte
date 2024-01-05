<script lang="ts">
  import Router, { push } from "svelte-spa-router";
  import routes from "./routes/routes";
  import config from "~/configs/config";
  import { userSlice, logoutUser } from "~/store/userSlice";

  const { routesConfig } = config;

  const handleLogout = () => {
    logoutUser();
    push(routesConfig.loginPage);
  };
</script>

<header>
  <nav class="max-w-full relative w-full h-full">
    <ul
      class="w-full flex items-center justify-center space-x-4 p-4 bg-black text-white"
    >
      <li><a href="#/">Home</a></li>
      <li><a href="#/signup">Signup</a></li>
      <li><a href="#/login">Login</a></li>
    </ul>
  </nav>
  <div class="absolute right-5 top-4 text-white">
    <button on:click={handleLogout}>{$userSlice.userName}</button>
  </div>
</header>

<main>
  <Router {routes} />
</main>

<style>
  @media (prefers-color-scheme: dark) {
    input {
      color: white !important;
    }
  }
</style>
