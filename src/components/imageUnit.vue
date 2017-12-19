<template>
  <div @click.native="showMenu"
       @mouseover="showMenu = true"
       @mouseout="showMenu = false"
       class="img-unit">
    <img :src="src[0] === '/' ? GLOBAL.server_address + src : src"
         class="new-note-preview">
    <div class="delete-image" v-show="showMenu">
      <md-button class="md-icon-button" @click.native="deleteImage">
        <md-icon style="color: white;">delete</md-icon>
      </md-button>
    </div>
    <md-progress-bar md-mode="query" class="progress-bar" v-if="!done_uploading"></md-progress-bar>
    <!--<div>done????????:{{done_uploading}}</div>-->
  </div>
</template>
<script>
  export default {
    data() {
      return {
        GLOBAL: this.GLOBAL,
        showMenu: false
      }
    },
    updated() {
//      console.log('image unit update')
//      this.$emit('rearrange')
    },
    methods: {
      showMenu() {
        console.log("over image");
        this.showMenu = true;
      },
      hideMenu() {
        console.log("out image");
        this.showMenu = false;
      },
      deleteImage() {
        this.$emit("deleteMe", this.index);
      }
    },
    props: ["src", "data_src", "done_uploading", "index"]
  }
</script>
<style>

  .img-unit {
    position: relative;
  }
  .delete-image {
    background-color: #1f1d1d;
    border-radius: 10px;
    opacity: 0.8;
    position: absolute;
    bottom: 6px;
    right: 6px;
  }
  .new-note-preview {
    height: 250px;
  }
  .progress-bar {
    background-color: #b5d0fd;
    width: 100%;
  }
  .md-progress-bar-track {
    background-color: #448aff;
  }
</style>
