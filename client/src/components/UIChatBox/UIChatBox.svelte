<script lang="ts">
  import logoBot from "../../assets/logo.png";
  import userImg from "../../assets/user-img.avif";
  import ImageChat from "../ImageChat/ImageChat.svelte";

  export let contentChat = "";
  export let typeChat = "";
  export let formatChat: any = null;
  export let botChat = "";
  export let imageChat: any = "";
</script>

{#if typeChat === "user"}
  <div
    class="w-full rounded-lg mb-4 bg-gradient-to-r from-purple-600 to-violet-900 p-[2px]"
  >
    <div
      class="w-full shadow-md rounded-lg p-4 flex flex-row items-center justify-end space-x-4 bg-[#27234d] text-white"
    >
      <div class="p-2 rounded-full flex items-center space-x-4">
        <div class="flex flex-col space-y-3 items-end">
          <p>{contentChat || ""}</p>
          {#if imageChat}
            <div class="p-4">
              <!-- <img
                src={imageChat}
                alt="User Upload"
                class="w-40 h-40 rounded-xl"
              /> -->
              <ImageChat src={imageChat} />
            </div>
          {/if}
        </div>
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
