<script lang="ts">
  export let showModal: Boolean; // boolean
  export let onSubmitted: any; // function

  let dialog: HTMLDialogElement; // HTMLDialogElement

  $: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => dialog.close()}
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    on:click|stopPropagation
    class="w-[400px] h-[250px] p-4 rounded-xl shadow-xl relative"
  >
    <slot name="header" />
    <hr />
    <slot />

    <!-- svelte-ignore a11y-autofocus -->
    <div
      class="flex items-center justify-center space-x-4 absolute bottom-5 left-1/2 -translate-x-1/2 w-full p-4"
    >
      <button
        autofocus
        class="w-1/2 p-1 bg-blue-500 text-white"
        on:click={() => {
          onSubmitted();
          dialog.close();
        }}>Yes</button
      >
      <button
        autofocus
        on:click={() => dialog.close()}
        class="w-1/2 p-1 bg-red-500 text-white">Cancel</button
      >
    </div>
  </div>
</dialog>

<style>
  dialog {
    max-width: 32em;
    border-radius: 0.2em;
    border: none;
    padding: 0;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog > div {
    padding: 1em;
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  button {
    display: block;
  }
</style>
