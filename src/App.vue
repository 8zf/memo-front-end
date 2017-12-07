<template>
  <div>
    <toolbar style="margin-bottom: 13px;"></toolbar>
    <note-form :notes="notes"
               :role="'create'"
               :on_edit="on_edit"
               :new_note.sync="new_note"
               id="new_note_form"
               v-on:refreshNotes="fetchData"
               v-on:openFull="openFull"
               v-on:closeFull="closeFull"
               style="padding-bottom: 15px;">
    </note-form>
    <div class="md-layout">
      <notes :notes="notes" v-on:refreshNotes="fetchData"></notes>
    </div>
    <cron-job :notes.sync="notes" :notes_ready="notes_ready"></cron-job>
    <!--<page-footer></page-footer>-->
  </div>
</template>

<script>
  import toolbar from './components/toolbar'
  import notes from './components/notes'
  import noteForm from './components/noteForm'
  import cronJob from './components/cronJob'
  import pageFooter from './components/pageFooter'
  import notificationHandler from './components/notificationHandler'
  export default {
    name: 'app',
    data () {
      return {
        notes_ready: false,
        on_edit: false,
        notes: [],
        new_note: {
          type: "",
          title: "",
          content: "",
          images: [],
          cron: "* * * * *",
          createdAt: "",
          updatedAt: "",
//        regular time localeString,
          informTime: "",
          isInformed: false,
          repeat: ""
        },
      }
    },
    components: {
      'toolbar': toolbar,
      'noteForm': noteForm,
      'notes': notes,
      "cronJob": cronJob,
      "page-footer": pageFooter
    },
    mounted() {

    },
    beforeMount() {
      console.log("app mounted");
      console.log("app mounted mounted");
      notificationHandler.requestPermission();
//      notificationHandler.showNotification("你是谁", "你爸");
      this.fetchData();
    },
    methods: {
      fetchData() {
        this.axios.get(this.GLOBAL.server_address + '/note')
          .then((response) => {
            console.log("获取数据成功");
            console.log(response);
            this.notes = response.data;
            this.notes_ready = true;
          })
          .catch((e) => {
            this.notes_ready = false;
            console.log("获取数据失败" + e);
          });
      }
    },
    mounted() {

    }
  }
</script>

<style scoped>
  /*@media (max-width: 900px) {*/
    /*.item-note {*/
      /*width: 100%;*/
      /*margin-left: 130px;*/
    /*}*/
    /*.card-body {*/
      /*width: 100%!important;*/
    /*}*/
  /*}*/
</style>
