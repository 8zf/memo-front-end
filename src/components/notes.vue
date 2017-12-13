<template>
  <div
    v-masonry
    item-selector=".item-note"
    fit-width="true"
    style="margin: 0 auto">
    <div
      v-masonry-tile
      class="item-note"
      v-model="notes"
      v-for="note in notes"
      :key="note">
      <note :note="note" :notes="notes" v-on:refreshThis="refreshThis"></note>
    </div>
  </div>
</template>
<script>
  import note from './note'
  import $ from "jquery"
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
  .notes {
    left: calc()
  }
  .choose {
    position: absolute;
    left: 0px;
    top: 0px;
    margin: 0px;
    z-index: 20;
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

  @media only screen and (max-width: 700px) {
    .item-note {
      width: 100%;
      padding: 0px 20px 15px 10px;
    }
  }

</style>
