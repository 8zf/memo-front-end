<template>
  <md-card md-with-hover
           :show="!showDialog"
           @click.native="openDialog"
           @mouseover.native="showMenu"
           @mouseout.native="hideMenu"
           class="card-body animated"
           v-bind:class="{zoomOut: isDisappear, fadeIn: !isDisappear}">
    <div class="card-media-container">
      <!--因为vue的特性態实时更新，所以使用动态插入dom元素的方法，但是现在可以使用双重nextTick-->
    </div>
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
  import loadImage from 'image-promise'
  export default {
    data () {
      return {
        showDialog: false,
        menuToggle: false,
        datePickerToggle: false,
        imagesLoaded: false,
        loadedImages: [],
        imageFlexBasis: [],
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
      console.log('mounted')
      loadImage(this.note.images)
        .then(imgs => {
          console.log('images loaded successfully')
          /**
           * load 完成之后进行重排
           * 之后嵌入图片
           */
          // rearrange
          this.rearrangeImages(imgs)
          // insert Nodes
          for (let i = 0; i < imgs.length; i++) {
//            this.loadedImages[i] = imgs[i].src
            let div = document.createElement('div')
            div.style.flexBasis = this.imageFlexBasis[i]
            div.appendChild(imgs[i])
            this.$el.querySelector(".card-media-container").appendChild(div)
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    methods: {
      rearrangeImages(imgs) {
        /**
         * 重排图片，使之适应宽度并且适当缩小
         * @param this.new_note this.image_data
         * 根据这两个来确定每三张一组的图片的缩放比例，也可以直接规定这一组的高度
         * 通过设置flex-basis来重新排列图片
         * 对于初始化状态，应当在vue更新dom之后进行操作
         */
        /**
         * 如果想要在load图片之前就得到图片信息，则需要使用cdn
         */
        console.log('rearrange in note!!!!!!!!!!!')
        let row_height = []
        let container_width = window.getComputedStyle(this.$el).width
        container_width = parseInt(container_width.substring(0, container_width.length - 2))
        console.log('container width: ' + container_width)
        /**
         * 倒序
         */
        console.log('have ' + imgs.length + ' images now')
        for (let i in imgs) {
          console.log('natural width: ' + imgs[i].naturalWidth + ', natural height: ' + imgs[i].naturalHeight)
          if ((i + 1) % 3 === 0 && i !== 0) {
            let h = container_width / (imgs[i - 2].naturalWidth / imgs[i - 2].naturalHeight + imgs[i - 1].naturalWidth / imgs[i - 1].naturalHeight + imgs[i].naturalWidth / imgs[i].naturalHeight)
            row_height.push(h)
            let w1 = h * imgs[i - 2].naturalWidth / imgs[i - 2].naturalHeight
            let w2 = h * imgs[i - 1].naturalWidth / imgs[i - 1].naturalHeight
            let w3 = h * imgs[i].naturalWidth / imgs[i].naturalHeight
            /**
             * 设置style，改为设置数据
             */
            this.imageFlexBasis[i - 2] = w1 + 'px'
            this.imageFlexBasis[i - 1] = w2 + 'px'
            this.imageFlexBasis[i] = w3 + 'px'
          }
          else if (i == (imgs.length - 1)) {
            if ((i + 1) % 3 === 1) {
              /**
               * 这里需要注意如果大于 container_width 则直接设置为 container_width，其实可以直接设置为 container_width
               */
              this.imageFlexBasis[i] = container_width + 'px'
            }
            else if ((i + 1) % 3 === 2) {
              let h = container_width / (imgs[i - 1].naturalWidth / imgs[i - 1].naturalHeight + imgs[i].naturalWidth / imgs[i].naturalHeight)
              row_height.push(h)
              let w1 = h * imgs[i - 1].naturalWidth / imgs[i - 1].naturalHeight
              let w2 = h * imgs[i].naturalWidth / imgs[i].naturalHeight
              this.imageFlexBasis[i - 1] = w1 + 'px'
              this.imageFlexBasis[i] = w2 + 'px'
            }
          }
        }
        console.log('rearrange results')
        console.log(this.imageFlexBasis)
      },
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

  .card-media-container {
    display: flex;
    flex-wrap: wrap;
  }

  @media only screen and (max-width: 700px) {
    .card-body {
      width: 100%;
      /*margin: 10px 0px;*/
    }
  }
</style>
