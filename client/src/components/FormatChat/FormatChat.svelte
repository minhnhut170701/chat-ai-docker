<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";
  export let chat: any;
  let splitChat = (str: any) => {
    const blocks = str.split("```"); // Split the string by triple backticks
    return blocks.map((block: any, index: any) => {
      let content =
        index % 2 === 0
          ? block.replace(/\n/g, "<br/>")
          : block.replace(/<br\/>/g, "\n"); // Replace newline with <br/> or vice versa
      content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Wrap content in <em> tags if it's surrounded by ***
      return {
        type: index % 2 === 0 ? "text" : "code",
        content: content,
      };
    });
  };
</script>

<div class="w-[90%] overflow-hidden">
  {#each splitChat(chat) as line, index (index)}
    {#if line.type === "code"}
      <HighlightAuto code={line.content} class="w-[80%]" />
    {:else}
      <p class="w-[80%]">{@html line.content}</p>
    {/if}
  {/each}
</div>
