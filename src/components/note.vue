<template>
  <md-card md-with-hover
           :show="!showDialog"
           @click.native="openDialog"
           @mouseover.native="showMenu"
           @mouseout.native="hideMenu"
           class="card-body animated"
           v-bind:class="{zoomOut: isDisappear, fadeIn: !isDisappear}">
    <md-card-media
      class="note-image"
      v-if="note.images.length && note.type === 'ordinary'"
      v-for="image_path in note.images"
      :key="image_path">
      <img :src="GLOBAL.server_address+image_path">
    </md-card-media>
    <md-card-header>
      <div class="md-title" v-html="note.title" style="white-space: pre-wrap;"></div>
    </md-card-header>
    <md-card-content >
      <div v-html="note.content" class="md-content" style="white-space: pre-wrap;"></div>
    </md-card-content>

    <p class="time-info">
      {{(note.updatedAt === note.createdAt || note.updatedAt === "") ? "创建于: " + note.createdAt : "更新于: " + note.updatedAt}}
    </p>
    <div style="margin-left: 16px;" v-show="note.informTime !== '' || datePickerToggle">
      <span style="color: grey;">提醒：</span>
      <date-picker :date="startTime"
                   :option="option"
                   :datePickerToggle="datePickerToggle">
      </date-picker>
    </div>


    <md-card-actions class="note-action" v-show="menuToggle">
      <md-speed-dial md-effect="fling" md-event="hover" md-direction="top">
        <md-speed-dial-target class="md-plain md-mini md-icon-button ">
          <md-icon>more_vert</md-icon>
        </md-speed-dial-target>
        <md-speed-dial-content>
          <!--<md-icon @click.native.prevent.stop="deleteNote">delete</md-icon>-->
          <!--<md-icon @click.stop.prevent.native="triggerDatePicker">alarm_add</md-icon>-->
          <md-button class="md-icon-button" @click.native.prevent.stop="deleteNote">
            <md-icon>delete</md-icon>
            <md-tooltip md-direction="right">删除记事</md-tooltip>
          </md-button>
          <md-button class="md-icon-button" @click.stop.prevent.native="triggerDatePicker">
            <md-icon>alarm_add</md-icon>
            <md-tooltip md-direction="right">设置提醒</md-tooltip>
          </md-button>
        </md-speed-dial-content>
      </md-speed-dial>
    </md-card-actions>

    <!--弹出窗口，使用路由，可以用于网页提醒-->
    <md-dialog :md-active.sync="showDialog" class="note-dialog">
      <note-form
        :on_edit="true"
        :new_note.sync="note"
        :role="'edit'"
        v-on:refreshThis="refreshThis">
      </note-form>
    </md-dialog>

  </md-card>
</template>
<script>
  import $ from 'jquery'
  import editNote from "./editNote"
  import noteForm from "./noteForm"
  import myDatepicker from 'vue-datepicker/vue-datepicker-es6.vue'
  export default {
    data () {
      return {
        showDialog: false,
        menuToggle: false,
        datePickerToggle: false,
        GLOBAL: this.GLOBAL,
        startTime: {
          time: this.note.informTime
        },
        endtime: {
          time: ''
        },
        option: {
          type: 'min',
          week: ['一', '二', '三', '四', '五', '六', '日'],
          month: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
          format: 'YYYY-MM-DD HH:mm',
          placeholder: '设置提醒时间',
          inputStyle: {
            'background-color': 'rgba(250, 250, 250, 1)',
            'display': 'inline-block',
            'padding': '6px',
//            'margin-left': '16px',
            'line-height': '22px',
//            'font-size': '16px',
            'border': '2px solid rgba(250, 250, 250, 1)',
//            'box-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.2)',
            'border-radius': '2px',
            'color': '#5F5F5F'
          },
          color: {
            header: '#ccc',
            headerText: '#f00'
          },
          buttons: {
            ok: '确定',
            cancel: '取消'
          },
          overlayOpacity: 0.5, // 0.5 as default
          dismissible: false // as true as default
        },
      }
    },
    mounted() {
//      this.isDisappear = false
    },
    methods: {
      showMenu() {
//        console.log('show')
        this.menuToggle = true
      },
      hideMenu() {
//        console.log('hide')
        this.menuToggle = false
      },
      openDialog() {
        console.log('open')
        this.showDialog = true
      },
      refreshThis() {
        this.$emit("refreshThis");
      },
      deleteNote() {
        this.axios.post(this.GLOBAL.server_address + '/note/delete/' + this.note._id)
          .then((response) => {
            console.log('删除成功');
            console.log(response);
            this.$emit("refreshThis");
          })
          .catch((e) => {
            console.log('删除失败');
            console.log(e);
          })
      },
      setInformTime() {
        let data = new FormData();
        data.append("informTime", this.startTime.time);
        data.append("isInformed", "false");
        this.axios.post(this.GLOBAL.server_address + '/note/update/' + this.note._id, data)
          .then((response) => {
            console.log("设置提醒时间成功");
            console.log(response);
            this.$emit("refreshThis");
          })
          .catch((e) => {
            console.log('设置时间失败');
            console.log(e);
          })
      },
      triggerDatePicker() {
        console.log("trigger date time picker");
        this.datePickerToggle = true;
      }
    },
    props: ["note", "notes"],
    watch: {
      'startTime.time': function (newValue, oldValue) {
        console.log("提醒时间");
        console.log(newValue);
        console.log(oldValue);
        if (newValue !== "") {
          console.log("变化了，可以设置了");
          this.setInformTime();
        }
      }
    },
    components: {
      "editNote": editNote,
      "noteForm": noteForm,
      'date-picker': myDatepicker
    }
  }
</script>
<style scoped>
  .choose {
    position: absolute;
    left: -20px;
    top: -20px;
    margin: 0px;
    z-index: 20;
  }

  .note-action {
    position: absolute;
    bottom: 0px;
    right: 0px;
  }

  .time-info {
    /*height: 10px;*/
    padding-left: 16px;
    color: grey;
  }

  .card-body {
    -vendor-animation-duration: 1s;
    margin: 4px;
    padding-bottom: 10px;
    background-color: #fafafa;
    width: 350px;
  }

  .note-dialog {
    overflow-y: scroll;
  }
  ::-webkit-scrollbar {
    display: none;
  }
  .md-speed-dial-target {
    box-shadow: none;
  }
  .md-speed-dial-content {
    box-shadow: none;
  }
  .menu-fade-enter-active {
    transition: all .7s ease;
  }

  .menu-fade-leave-active {
    transition: all .7s
  }

  .menu-fade-enter, .menu-fade-leave-active {
    /*transform: translateX(10px);*/
    opacity: 0;
  }

  @media only screen and (max-width: 700px) {
    .card-body {
      width: 100%;
      /*margin: 10px 0px;*/
    }
  }
</style>
