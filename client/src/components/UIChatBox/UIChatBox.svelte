<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import logoBot from "../../assets/logo.png";
  import userImg from "../../assets/user-img.avif";

  export let contentChat = "";
  export let typeChat = "";
  export let formatChat: any = null;
  export let botChat = "";
</script>

{#if typeChat === "user"}
  <div
    class="w-full rounded-lg mb-4 bg-gradient-to-r from-purple-600 to-violet-900 p-[2px]"
  >
    <div
      class="w-full shadow-md rounded-lg p-4 flex flex-row items-center justify-end space-x-4 bg-[#27234d] text-white"
    >
      <div class="p-2 rounded-full flex items-center space-x-4">
        <p>{contentChat || ""}</p>
        <img
          src={userImg}
          alt="user"
          class="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </div>
  </div>
{:else}
  <div
    class=" w-full rounded-lg bg-gradient-to-r from-purple-600 to-violet-900 p-[2px]"
  >
    <div
      class="w-full shadow-md rounded-lg p-4 flex flex-row space-x-4 bg-[#27234d]"
    >
      <div class="p-2 bg-white rounded-full h-full">
        <img
          src={logoBot}
          alt="Logo Cybridge Asia"
          class="w-10 h-10 object-contain"
        />
      </div>
      <div class="w-[90%] overflow-hidden">
        {#if formatChat}
          <svelte:component this={formatChat} chat={botChat} />
        {:else}
          <p class="text-white">{contentChat || ""}</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
