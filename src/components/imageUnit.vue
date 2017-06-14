<template>
  <div @click.native="showMenu">
    <img :src="src[0] === '/' ? GLOBAL.server_address + src : src"
         class="new-note-preview"
         @click.native="showMenu"
         @mouseout.native="hideMenu">
    <md-progress md-indeterminate v-if="!done_uploading[index]"></md-progress>
    <md-button class="md-icon-button delete-image" @click.native="deleteImage">
      <md-icon>delete</md-icon>
    </md-button>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        GLOBAL: this.GLOBAL,
        toggleMenu: false
      }
    },
    methods: {
      showMenu() {
          console.log("over image");
        this.toggleMenu = true;
      },
      hideMenu() {
          console.log("out image");
        this.toggleMenu = false;
      },
      deleteImage() {
          this.$emit("deleteMe", this.index);
      }
    },
    props: ["src", "done_uploading", "index"]
  }
</script>
<style>

</style>
