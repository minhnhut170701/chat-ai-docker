<script lang="ts">
  import Icon from "@iconify/svelte";
  import { onMount, afterUpdate } from "svelte";
  import github from "svelte-highlight/styles/github";
  import { RingLoader } from "svelte-loading-spinners";
  import FormatChat from "~/components/FormatChat/FormatChat.svelte";
  import UIChatBox from "~/components/UIChatBox/UIChatBox.svelte";
  import UIModal from "~/components/UIModal/UIModal.svelte";
  import { userSlice } from "~/store/userSlice";
  import logoBot from "../../assets/logo.png";
  import {
    chatDetailSliceCreate,
    continueChat,
  } from "../../store/chatDetailSlice";
  import {
    addNewChat,
    chatSlice,
    deleteChat,
    getChatInfoDetail,
    setListChat,
    uploadImage,
  } from "../../store/chatSlice";
  let showPopup = false;
  let chatDetail: any = [];
  let currentChatId: string = "";
  let chatInput: string = "";
  let imageData: any = null;
  let previousChatInputs: { [key: string]: string } = {};
  let loading: boolean = false;
  let showModal = false;
  let loadingNewPage = false;
  let closeToolBars = false;

  onMount(async () => {
    try {
      await setListChat($userSlice._id);
    } catch (error) {
      console.log(error);
    }
  });

  const getChatDetail = async (chatId: string, newPage: boolean) => {
    if (newPage) loadingNewPage = true;
    try {
      const res = await getChatInfoDetail(chatId);
      chatDetail = res;
      currentChatId = chatId;
      if (newPage) loadingNewPage = false;
    } catch (error) {
      console.log(error);
      if (newPage) loadingNewPage = false;
    }
  };

  const handleAddNewChat = async () => {
    try {
      await addNewChat($userSlice._id);
      await getChatDetail(
        $chatSlice.data[$chatSlice.data.length - 1]._id,
        false
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleUploadImage = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement;
    }
  ) => {
    try {
      if (e.currentTarget.files) {
        await uploadImage(e.currentTarget.files[0], currentChatId);
        await getChatDetail(currentChatId, false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChat = async (newChat: boolean) => {
    const data = {
      chatId: currentChatId,
      inputChat: chatInput,
    };

    const dataNewChat = {
      userInput: chatInput,
      role: "assistant",
      chatId: currentChatId,
      image: "",
    };
    try {
      chatInput = "";
      if (!newChat) {
        await continueChat(data);
      } else {
        await chatDetailSliceCreate(dataNewChat);
      }
      await getChatDetail(currentChatId, false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputSubmit = async () => {
    loading = true;

    if (currentChatId) {
      previousChatInputs[currentChatId] = chatInput;
      if (chatDetail.length > 0) {
        await handleChat(false);
        previousChatInputs[currentChatId] = "";
        loading = false;
      } else {
        await handleChat(true);
        previousChatInputs[currentChatId] = "";
        loading = false;
      }
    } else {
      await handleAddNewChat();
      previousChatInputs[currentChatId] = chatInput;
      await handleChat(true);
      previousChatInputs[currentChatId] = "";
      loading = false;
    }
  };

  const removeChat = async (chatId: string) => {
    currentChatId = chatId;
    const data = {
      userId: $userSlice._id,
      chatId: currentChatId,
    };
    try {
      await deleteChat(data);
      await setListChat($userSlice._id);
      chatDetail = [];
      currentChatId = "";
    } catch (error) {
      console.log(error);
    }
  };

  // afterUpdate(() => {
  //   console.log("chatSlice", $chatSlice);
  // });
</script>

<svelte:head>
  {@html github}
</svelte:head>

<div
  class="max-w-full w-full p-2 bg-primary flex items-center justify-center space-x-6"
>
  <p class="p-2 bg-white rounded-full">
    <img src={logoBot} alt="Logo Cybridge Asia" class="w-10 h-10 mx-auto" />
  </p>
  <h1 class="text-xl font-bold text-center uppercase text-white">
    Cybridge Asia AI
  </h1>
</div>

<div
  class="flex flex-row w-full max-w-full bg-[#1d1947] backdrop-opacity-10 relative"
  style="height: calc(100vh - 128px);"
>
  <div
    class={` mb-2 p-4 relative bg-[#1e185a] shadow-lg rounded-lg ${
      closeToolBars ? "hidden" : "w-[30%]"
    }`}
  >
    <h2 class="text-center text-xl text-white mb-2">List Chat</h2>
    <div class="tooltip -right-[90%] -top-10" data-tip="Close Bar">
      <button
        on:click={() => (closeToolBars = !closeToolBars)}
        class=" w-10 h-10 rounded-lg bg-white text-black flex items-center justify-center hover:bg-transparent
         hover:text-white hover:border hover:border-white
         transition-all duration-500"
      >
        <Icon icon="fluent:ios-arrow-24-regular" />
      </button>
    </div>

    <ul class="flex flex-col space-y-2 w-full h-[400px] overflow-y-auto">
      {#if $chatSlice.loading}
        <p>Loading...</p>
      {:else}
        {#each $chatSlice.data as chat, index (index)}
          <li
            class={`p-2 bg-gradient-to-r  cursor-pointer flex items-center justify-center group relative ${
              currentChatId === chat._id
                ? "bg-white text-black"
                : "from-purple-600 to-violet-900 text-white"
            }`}
          >
            <UIModal bind:showModal onSubmitted={() => removeChat(chat._id)}>
              <h2 slot="header" class="font-bold text-center">
                Are you sure you want to delete this Conversation?
              </h2>
              <p class="p-4 text-center">
                This action cannot be undone and you will lose all progress.
              </p>
            </UIModal>
            <button
              on:click={() => getChatDetail(chat._id, true)}
              class="w-[80%]">{chat.chatName} {index + 1}</button
            >
            <button
              on:click={() => (showModal = !showModal)}
              class="items-end p-2 hidden bg-red-500 text-white group-hover:block absolute right-5 top-1/2 -translate-y-1/2"
            >
              <Icon icon="ph:trash" />
            </button>
          </li>
        {/each}
      {/if}
    </ul>
    <div
      class="absolute bottom-0 h-[80px] w-full left-0 flex items-center justify-between px-2"
    >
      <div class="w-[90%]">
        <button class="w-full h-full p-2 bg-white" on:click={handleAddNewChat}
          >Add new Conversation</button
        >
      </div>
      <button class="text-white" on:click={() => (showPopup = !showPopup)}>
        <p>....</p>
      </button>
    </div>
    {#if showPopup}
      <div class="absolute left-0 p-2 bottom-[80px] bg-red-400 w-full">
        <button>Clean Conversation</button>
      </div>
    {/if}
  </div>
  {#if closeToolBars}
    <div class="flex items-end justify-end mb-2 p-2">
      <div class="tooltip left-2" data-tip="Show Bar">
        <button
          on:click={() => (closeToolBars = !closeToolBars)}
          class="rounded-lg bg-white text-black w-10 h-10 flex items-center justify-center transform rotate-180 hover:bg-transparent
           hover:text-white hover:border hover:border-white
           transition-all duration-500"
        >
          <Icon icon="fluent:ios-arrow-24-regular" />
        </button>
      </div>
    </div>
  {/if}
  {#if loadingNewPage}
    <div
      class={`overflow-hidden h-full flex items-center justify-center flex-col space-y-4 w-[70%] `}
    >
      <RingLoader size="60" color="#f97316" unit="px" duration="1s" />
      <p class="text-white">Loading...</p>
    </div>
  {:else}
    <div
      class={` overflow-hidden h-full ${!closeToolBars ? "w-[70%]" : "w-full"}`}
    >
      <div class="h-[85%] p-4 overflow-y-auto">
        {#each chatDetail as chat, index (index)}
          <div class="mb-4 text-white">
            {#if chat.userChat}
              <UIChatBox contentChat={chat.userChat} typeChat="user" />
            {/if}
            {#if chat.botChat}
              <UIChatBox formatChat={FormatChat} botChat={chat.botChat} />
            {/if}
          </div>
        {/each}
        {#if loading && previousChatInputs[currentChatId]}
          <UIChatBox
            contentChat={previousChatInputs[currentChatId]}
            typeChat="user"
          />
          <UIChatBox contentChat="Thinking...." typeChat="bot" />
        {/if}
      </div>
      <div class="mt-5 p-2 h-14">
        <form
          class="flex flex-row space-x-4"
          on:submit|preventDefault={handleInputSubmit}
        >
          <div class="tooltip tooltip-right" data-tip="Upload image">
            <button
              class="p-2 bg-white rounded-full w-10 h-10 flex justify-center items-center relative"
              type="button"
            >
              <input
                type="file"
                name="file"
                bind:value={imageData}
                on:change={handleUploadImage}
                class="file-input file-input-ghost w-full h-full outline-none opacity-0 absolute top-0 left-0"
              />
              <Icon icon="gridicons:add-image" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Enter a prompt here..."
            bind:value={chatInput}
            class="p-2 flex-1 border-2 outline-none border-blue-400 rounded-lg bg-transparent text-white"
          />
          <button
            class="w-[10%] p-2 bg-blue-400 text-white font-bold rounded-lg outline-none hover:bg-blue-500 transition-all duration-300"
            >Submit</button
          >
        </form>
      </div>
    </div>
  {/if}
</div>
