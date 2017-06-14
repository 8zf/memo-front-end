<template>
  <md-card md-with-hover
           @click.native="openDialog('detail')"
           @mouseover.native="showMenu"
           @mouseout.native="hideMenu"
           class="card-body animated"
           v-bind:class="{zoomOut: isDisappear, fadeIn: !isDisappear}"
           style="margin: 4px; padding-bottom: 10px; background-color: #fafafa; width: 300px;"
           draggable="true">

    <!--悬浮菜单-->

    <!--<md-button class="md-fab md-mini md-raised choose" v-show="menuToggle" @click.native.stop.prevent="">-->
    <!--<md-icon>check</md-icon>-->
    <!--</md-button>-->
    <!--v-show="menuToggle"-->
    <!--<p v-show="menuToggle" class="menu">菜单</p>-->
    <div
      v-masonry
      item-selector=".note-image">
      <md-card-media
        v-masonry-tile
        class="note-image"
        v-if="note.images.length && note.type === 'ordinary'"
        v-for="image_path in note.images"
        :key="image_path">
        <img :src="GLOBAL.server_address+image_path">
      </md-card-media>
    </div>
    <div class="card-content">
      <md-card-header>
        <div class="md-title" v-html="note.title"></div>
      </md-card-header>
      <md-card-content v-html="note.content"></md-card-content>
    </div>

    <p class="time-info">
      {{note.updatedAt === "" ? "创建于: " + note.createdAt : "更新于: " + note.updatedAt}}
    </p>
    <div style="margin-left: 16px;" v-show="note.informTime !== '' || datePickerToggle">
      <span style="color: grey;">提醒：</span>
      <date-picker :date="startTime"
                   :option="option"
                   :datePickerToggle="datePickerToggle">
      </date-picker>
    </div>


    <md-card-actions class="note-action" v-show="menuToggle">
      <md-speed-dial md-mode="fling" md-direction="top" @click.native="test">
        <md-button md-fab-trigger @click.native.prevent.stop="inform" class="md-icon-button md-mini">
          <md-icon md-icon-morph>close</md-icon>
          <md-icon>more_vert</md-icon>
          <md-tooltip md-direction="bottom">更多操作</md-tooltip>
        </md-button>
        <md-button class="md-icon-button" @click.native.prevent.stop="deleteNote">
          <md-icon>delete</md-icon>
          <md-tooltip md-direction="right">删除记事</md-tooltip>
        </md-button>
        <md-button class="md-icon-button" @click.stop.prevent.native="triggerDatePicker">
          <md-icon>alarm_add</md-icon>
          <md-tooltip md-direction="right">设置提醒</md-tooltip>
        </md-button>
      </md-speed-dial>
    </md-card-actions>

    <!--弹出窗口，使用路由，可以用于网页提醒-->
    <md-dialog
      @open="onOpen"
      @close="onClose"
      ref="detail">

      <note-form
      style="margin: 0px!important;"
      :on_edit="true"
      :new_note.sync="note"
      :role="'edit'"
      v-on:toggleClose="toggleClose"
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
        isDisappear: null,
        menuToggle: false,
        datePickerToggle: false,
        closeToggle: false,
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
      test() {
        console.log("我看见你了")
      },
      openDialog(ref) {
        this.$refs[ref].open();
      },
      closeDialog(ref) {
        this.$refs[ref].close();
      },
      onOpen() {
        //设置透明度0
        this.isDisappear = true;
        console.log('Opened');
      },
      onClose(type) {
        //设置透明度1
        this.isDisappear = false;
        console.log('Closed', type);
      },
      showMenu() {
//        console.log("show menu");
        this.menuToggle = true;
      },
      hideMenu() {
//        console.log("hide menu");
        this.menuToggle = false;
      },
      dragStart(e) {
        console.log(e)
      },
      dragEnter(e) {
        console.log("drag enter");
        console.log(e.target);
      },
      dropEnd(e) {
        console.log("drop here");
        console.log(e);
      },
      toggleClose() {
        this.$refs['detail'].close();
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
      inform() {

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
    overflow: visible;
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


</style>
