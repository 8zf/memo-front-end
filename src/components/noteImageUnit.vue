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

</script>
<style scoped>

</style>
