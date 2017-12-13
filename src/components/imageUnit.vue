<template>
  <div @click.native="showMenu" class="img-unit">
    <img :src="src[0] === '/' ? GLOBAL.server_address + src : src"
         class="new-note-preview"
         @mouseover.native="showMenu"
         @mouseout.native="hideMenu">
    <div class="delete-image">
      <md-button class="md-icon-button" @click.native="deleteImage">
        <md-icon>delete</md-icon>
      </md-button>
    </div>
    <md-progress-bar md-mode="query" class="progress-bar" v-if="!done_uploading[index]"></md-progress-bar>
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
  .delete-image {
    float: right;
    top: -43px;
  }
  .new-note-preview {
    /*max-width: 602px;*/
  }
  .progress-bar {
    background-color: #b5d0fd;
    width: 100%;
  }
  .md-progress-bar-track {
    background-color: #448aff;
  }
</style>
