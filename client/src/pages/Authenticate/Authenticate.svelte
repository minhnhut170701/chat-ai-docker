<script lang="ts">
  import { location, link, push } from "svelte-spa-router";
  import config from "~/configs/config";
  import { loginUser, registerUser } from "~/store/userSlice";
  const { routesConfig } = config;
  let userName = "";
  let password = "";
  let userEmail = "";
  let confirmPassword = "";

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    if (target.id === "userEmail") {
      userName = target.value;
    } else if (target.id === "password") {
      password = target.value;
    } else if (target.id === "confirmPassword") {
      confirmPassword = target.value;
    } else if (target.id === "userEmail") {
      userEmail = target.value;
    }
  };

  const handleLogin = async () => {
    const data = {
      userEmail,
      userPassword: password,
    };
    try {
      const res: any = await loginUser(data);

      if (res.status === 400) {
        alert(res.response.data.message);
        return;
      } else {
        push(routesConfig.chatPage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Password and confirm password are not match");
      return;
    }
    const data = {
      userName,
      userEmail,
      userPassword: password,
    };
    try {
      await registerUser(data);
      push(routesConfig.loginPage);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = () => {
    if (userName.length === 0 || password.length === 0) {
      alert("Please enter username and password");
      return;
    }
    if ($location === routesConfig.loginPage) {
      handleLogin();
    } else if ($location === routesConfig.signupPage) {
      handleSignUp();
    }
  };
</script>

<!-- <p>location: {$location}</p> -->
<div class="bg-primary max-w-full" style="height: calc(100vh - 56px);">
  {#if $location === routesConfig.loginPage}
    <div class="max-w-7xl h-full mx-auto flex items-center justify-center">
      <div class="w-full flex justify-center items-center flex-col">
        <h1
          class="text-2xl text-center text-white uppercase font-bold p-4 mb-4"
        >
          Login
        </h1>
        <div class="bg-white rounded-xl shadow-xl p-8 w-[40%]">
          <form
            class="flex flex-col space-y-4"
            on:submit|preventDefault={handleSubmit}
          >
            <div class="flex flex-col space-y-1">
              <label for="userEmail" class="font-bold">userEmail: </label>
              <input
                type="text"
                id="userEmail"
                bind:value={userEmail}
                on:change={handleInputChange}
                placeholder="Enter your username"
                class="p-2 border rounded-lg outline-none"
              />
            </div>
            <div class="flex flex-col space-y-1">
              <label for="password" class="font-bold">Password: </label>
              <input
                type="password"
                id="password"
                bind:value={password}
                on:change={handleInputChange}
                placeholder="Enter your password"
                class="p-2 border rounded-lg outline-none"
              />
            </div>
            <div class="flex flex-col space-y-1">
              <button
                type="submit"
                class="p-2 bg-primary text-white rounded-lg"
              >
                Login
              </button>
            </div>
          </form>

          <p class="underline text-primary text-center pt-4">
            <a href={routesConfig.signupPage} use:link>
              Don't have an account? Sign up</a
            >
          </p>
        </div>
      </div>
    </div>
  {/if}

  {#if $location === routesConfig.signupPage}
    <div class="max-w-7xl h-full mx-auto flex items-center justify-center">
      <div class="w-full flex justify-center items-center flex-col">
        <h1
          class="text-2xl text-center text-white uppercase font-bold p-4 mb-4"
        >
          SignUp
        </h1>
        <div class="bg-white rounded-xl shadow-xl p-8 w-[40%]">
          <form
            class="flex flex-col space-y-4"
            on:submit|preventDefault={handleSubmit}
          >
            <div class="flex flex-col space-y-1">
              <label for="username" class="font-bold">UserName: </label>
              <input
                type="text"
                id="username"
                bind:value={userName}
                on:change={handleInputChange}
                placeholder="Enter your username"
                class="p-2 border rounded-lg outline-none"
              />
            </div>
            <div class="flex flex-col space-y-1">
              <label for="userEmail" class="font-bold">userEmail: </label>
              <input
                type="text"
                id="userEmail"
                bind:value={userEmail}
                on:change={handleInputChange}
                placeholder="Enter your username"
                class="p-2 border rounded-lg outline-none"
              />
            </div>
            <div class="flex flex-col space-y-1">
              <label for="password" class="font-bold">Password: </label>
              <input
                type="password"
                id="password"
                bind:value={password}
                on:change={handleInputChange}
                placeholder="Enter your password"
                class="p-2 border rounded-lg outline-none"
              />
            </div>
            <div class="flex flex-col space-y-1">
              <label for="confirmPassword" class="font-bold"
                >Confirm Pass:
              </label>
              <input
                type="password"
                id="confirmPassword"
                bind:value={confirmPassword}
                on:change={handleInputChange}
                placeholder="Enter your password"
                class="p-2 border rounded-lg outline-none"
              />
            </div>
            <div class="flex flex-col space-y-1">
              <button
                type="submit"
                class="p-2 bg-primary text-white rounded-lg"
              >
                SignUp
              </button>
            </div>
          </form>

          <p class="underline text-primary text-center pt-4">
            <a href={routesConfig.loginPage} use:link>
              You have account? Login</a
            >
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
