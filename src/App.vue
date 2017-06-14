<template>
  <md-layout md-column>
    <toolbar></toolbar>
    <note-form :notes="notes"
               :on_edit="on_edit"
               :role="'create'"
               :new_note.sync="new_note"
               v-on:refreshNotes="fetchData"
               v-on:openFull="openFull"
               v-on:closeFull="closeFull">
    </note-form>
    <md-layout class="out-of-notes"
               md-align="center">
      <notes :notes="notes" v-on:refreshNotes="fetchData"></notes>
    </md-layout>
    <cron-job :notes.sync="notes" :notes_ready="notes_ready"></cron-job>
    <page-footer></page-footer>
  </md-layout>
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
        notes: [],
//        notes: [
//          {
//            type: "ordinary",
//            title: "灵感",
//            content: "在线memo可以记下创意",
//            images: ["https://keep.google.com/media/1oY9PDQIoTM-qy08855Pzit2v0H2-db0?accept=image/gif,image/jpeg,image/jpg,image/png,image/webp,audio/aac&sz=600"],
//            informTime: "* * * * *"
//          },
//          {
//            type: "list",
//            lists: [
//              {content: "起床", done: false},
//              {content: "刷牙", done: false},
//              {content: "吃饭", done: false}
//            ],
//            title: "功能",
//            content: "设置网页提醒,以及到达率较高的短信提醒，随时随地。这里有图片吗，并没有",
//            images: []
//          },
//          {
//            type: "ordinary",
//            title: "多彩",
//            content: "支持导入图片，链接"
//          },
//          {
//            id: "3",
//            type: "ordinary",
//            title: "智",
//            content: "将接入语意识别，使用更加智能"
//          },
//        ],
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
        on_edit: false,
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
      onClick() {
        this.on_edit = false;
      },
      openFull() {
        this.on_edit = true;
      },
      closeFull() {
        console.log("close full");
        this.on_edit = false;
      },
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
  @media (max-width: 1300px) {
    .out-of-notes {
      width: 100%;
    }
  }

  .out-of-notes {
    margin-top: 13px;
    width: 1240px;
    margin-left: auto;
    margin-right: auto
  }
</style>
