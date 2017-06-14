<template>
  <md-layout
    md-align="center"
    class="notes"
    v-masonry
    item-selector=".item-note"
  >
    <div
      v-masonry-tile
      class="item-note"
      v-model="notes"
      v-for="note in notes"
      :key="note"
      style="display: inline-block">
      <note :note="note" :notes="notes" v-on:refreshThis="refreshThis"></note>
    </div>
  </md-layout>
</template>
<script>
  import note from './note'
//  import eventBus from './eventBus'
  import $ from "jquery"
  //  import draggable from 'vuedraggable'
  import masonry from 'masonry-layout'
  export default {
    data () {
      return {}
    },
    mounted() {
//      console.log("notes mounted");
//      eventBus.$emit("notesLoaded");
    },
    methods: {
      showMenu() {
        console.log("you hover,motherfucker");
      },
      click() {
        console.log("click motherfucker");
      },
      hideMenu() {
        console.log("you should hide menu");
      },
      refreshThis() {
        this.$emit("refreshNotes");
      }
    },
    props: ["notes"],
    components: {
      "note": note,
//      "draggable": draggable
    }
  }

</script>
<style scoped>
  .choose {
    position: absolute;
    left: 0px;
    top: 0px;
    margin: 0px;
    z-index: 20;
  }

  .notes {
  }

  .menu-fade-enter-active {
    transition: all .3s ease;
  }

  .menu-fade-leave-active {
    transition: all .3s
  }

  .menu-fade-enter, .menu-fade-leave-active {
    /*transform: translateX(10px);*/
    opacity: 0;
  }
</style>
