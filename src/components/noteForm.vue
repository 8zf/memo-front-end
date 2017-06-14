<template>
  <md-layout md-align="center">
    <div class="md-card"
         style="width: 600px; max-height: 800px; margin: 0px; display: flex; outline: none;background-color: #fafafa"
         v-on:click="openFull"
         tabindex="0">

      <md-card-media v-if="new_note.images.length"
                     class="multi-images"
                     v-for="(image, index) in new_note.images"
                     :index="index"
                     :key="image">
        <!--控制删除按钮和进度条的显示消失-->
        <image-unit :src="image" :done_uploading="done_uploading" v-on:deleteMe="deleteMe($event)" :index="index"></image-unit>
        <!--<img :src="image[0] === '/' ? GLOBAL.server_address + image : image"-->
             <!--class="new-note-preview">-->
        <!--<md-progress md-indeterminate v-if="!done_uploading[index]"></md-progress>-->
        <!--<md-button class="md-icon-button delete-image" v-if="!done_uploading[index]" @click.native="deleteImage">-->
          <!--<md-icon>delete</md-icon>-->
        <!--</md-button>-->
      </md-card-media>

      <!--新记事标题与内容-->
      <!--v-on:keyup.enter="switchToContent"-->
      <div contenteditable="true"
           style="outline: none; white-space: pre-wrap; font-size: large; margin-left: 5px; margin-top: 5px;"
           placeholder="标题"
           id="new_title"
           v-on:keydown.enter.prevent="pressTab($event)"
           ref="title"
           tabindex="1"
           v-html="new_note.title">
      </div>

      <div contenteditable="true"
           style="outline: none; margin-left: 5px;"
           placeholder="添加内容..."
           id="new_content"
           ref="content"
           tabindex="2"
           v-html="new_note.content">
      </div>

      <div contenteditable="false" style="padding-left: 590px;">
      </div>
      <transition name="tool">
        <md-layout v-if="on_edit">
          <md-layout md-flex="80">
            <!--图片-->
            <md-button @click.native.stop="uploadFile">
              <md-icon>
                photo
              </md-icon>
              <md-tooltip md-direction="bottom">添加图片</md-tooltip>
              <input type="file"
                     name="note_image"
                     id="image_input"
                     accept="image/*"
                     class="image-form"
                     v-on:change="onFileChange">
            </md-button>
            <!--提醒-->
            <!--<md-button>-->
              <!--<md-icon>-->
                <!--alarm_add-->
              <!--</md-icon>-->
              <!--<md-tooltip md-direction="bottom">设置提醒</md-tooltip>-->
            <!--</md-button>-->
          </md-layout>

          <md-layout md-align="end">
            <!--提交-->
            <md-button md-fab md-fab-bottom-right @click.native.stop="addOrEdit" class="md-primary">
              完成
            </md-button>
          </md-layout>
        </md-layout>
      </transition>
    </div>
    <md-snackbar ref="snackbar">
      <span>{{snackbar_content}}</span>
      <md-button class="md-accent" md-theme="light-blue" @click.native="$refs.snackbar.close()">已阅</md-button>
    </md-snackbar>
  </md-layout>
</template>
<script>
  import $ from "jquery";
  import imageUnit from './imageUnit'
  export default {
    data () {
      return {
        //as well this ois the standard template
//        new_note: {
//          type: "",
//          title: "",
//          content: "",
//          images: [],
//          cron: "* * * * *"
//        },
        new_list: {},
        image_data: [],
        done_uploading: [],
        have_file: false,
        snackbar_content: ""
      }
    },
    beforeMount() {
      this.done_uploading = new Array(this.new_note.images.length);
      for (let i = 0; i < this.new_note.images.length; i++) {
        this.done_uploading[i] = true;
      }
    },
    methods: {
//      tmp() {
//        v-on:focusin="focusOutside"
//        v-on:focusout="blurOutside"
//        v-on:focusin="focusTitle"
//        v-on:focusout="blurTitle"
//        v-on:focusin="focusContent"
//        v-on:focusout="blurContent"
//      },
//      focusOutside() {
//        console.log('focus outside');
//        console.log("焦点个数：" + $(':focus').length);
//      },
//      blurOutside() {
//        console.log('blur outside');
//        console.log("焦点个数：" + $(':focus').length);
//
//      },
//      blurTitle() {
//        console.log('blur title')
//        console.log("焦点个数：" + $(':focus').length);
//
//      },
//      blurContent() {
//        console.log('blur content')
//        console.log("焦点个数：" + $(':focus').length);
//
//      },
//      focusTitle() {
//        console.log('focus title')
//        console.log("焦点个数：" + $(':focus').length);
//
//      },
//      focusContent() {
//        console.log('focus content')
//        console.log("焦点个数：" + $(':focus').length);
//
//      },
      openFull() {
        console.log("open editor");
        this.$emit('openFull');
      },
      addOrEdit() {
        if (this.role === "create") {
          this.addNote();
        }
        else if (this.role === "edit") {
          this.editNote();
        }
      },
      addNote() {
        console.log("close full");
        this.$emit("closeFull");
        console.log(this.$refs.title.innerHTML);
        console.log(this.$refs.content.innerHTML);
        if (this.$refs.title.innerHTML === "" && this.$refs.content.innerHTML === "" && this.new_note.images.length === 0) {
          return
        }
        this.new_note.type = "ordinary";
        this.new_note.title = this.$refs.title.innerHTML;
        this.new_note.content = this.$refs.content.innerHTML;
        //调用API，并且更新本地note
        let data = new FormData();
        //将数组转换成字符串
        this.new_note.images = this.new_note.images.toString();
        for (let key in this.new_note) {
          console.log("key: " + key);
          console.log("value: " + this.new_note[key]);
          data.append(key, this.new_note[key]);
        }
        data.set("createdAt", new Date().toLocaleString());
        this.axios.post(this.GLOBAL.server_address + '/note', data)
          .then((response) => {
            if (response.data.result.ok === 1) {
              console.log('插入数据成功，更新数据');
              console.log(response);
              this.$emit("refreshNotes");
              this.snackbar_content = "创建成功";
              this.$refs.snackbar.open();
            }
          })
          .catch((e) => {
            console.log('插入数据失败');
            console.log(e);
            this.snackbar_content = "插入数据失败" + e;
            this.$refs.snackbar.open();
          });
        this.new_note.type = "";
        this.new_note.title = "";
        this.new_note.content = "";
        this.new_note.images = [];
        this.image_data = [];
        this.$refs.title.innerHTML = '';
        this.$refs.content.innerHTML = '';

      },
      editNote() {
        console.log('modify note');
        let data = new FormData();
        data.append('title', this.$refs.title.innerHTML);
        data.append('content', this.$refs.content.innerHTML);
        data.append('images', this.new_note.images.toString());
        data.append('updatedAt', new Date().toLocaleString());
        this.axios.post(this.GLOBAL.server_address + '/note/update/' + this.new_note._id, data)
          .then((response) => {
            console.log('modify success');
            console.log(response);
            this.snackbar_content = "modify success";
            this.$refs.snackbar.open();
            this.$emit("refreshThis");
            this.$emit("toggleClose");
          })
          .catch((e) => {
            console.log('modify failed');
            this.snackbar_content = "modify failed" + e;
            this.$refs.snackbar.open();
          });

      },
      editNoteImages() {
        console.log('modify note image');
        let data = new FormData();
        data.append('images', this.new_note.images.toString());
        this.axios.post(this.GLOBAL.server_address + '/note/update/' + this.new_note._id, data)
          .then((response) => {
            console.log('modify image success');
            console.log(response);
            this.snackbar_content = "删除图片成功";
            this.$refs.snackbar.open();
//            this.$emit("refreshThis");
//            this.$emit("toggleClose");
          })
          .catch((e) => {
            console.log('modify failed');
            this.snackbar_content = "modify failed" + e;
            this.$refs.snackbar.open();
          });
      },
      uploadFile() {
        console.log("you should upload file");
        $("#image_input").trigger("click");
//        console.log("filename" + $("#image_input").val());
      },
      onFileChange() {
        console.log("change file input");
        //当没选中图片时，清除预览
        if (document.getElementById("image_input").files.length === 0) {
//          this.have_file = false;
//          document.querySelector('#new_note_preview').src = '';
          return;
        }
        this.have_file = true;
        let reader = new FileReader();
        //读取选中的图片，并转换成dataURL格式
        reader.readAsDataURL(document.getElementById("image_input").files[0]);
        reader.onload = (e) => {
          //读取完成，生成预览，加进度条，上传图片，去掉进度条
          let now_length = this.new_note.images.push(e.target.result);
          //加上上传进度条
          this.done_uploading.push(false);
          //创建一个multipart请求
          let data = new FormData();
          data.append('note_image', document.getElementById("image_input").files[0]);
          this.axios.post(this.GLOBAL.server_address + "/upload", data)
            .then((response) => {
              this.done_uploading[now_length - 1] = true;
              console.log("done_uploading: ");
              console.log(this.done_uploading);
              console.log("图片上传成功");
              this.snackbar_content = "图片上传成功";
              this.$refs.snackbar.open();
              this.new_note.images[now_length - 1] = response.data.filepath;
              console.log(response);
//              this.new_note.images.push(response.data.filepath);
            })
            .catch((e) => {
              console.log("图片上传失败，" + e);
              this.done_uploading[now_length - 1] = true;
              console.log(this.done_uploading);
              this.new_note.images.splice(now_length - 1, 1);
              this.snackbar_content = "图片上传失败" + e;
              this.$refs.snackbar.open();
            });
        };
      },
      pressTab(ev) {
        if (ev.keyCode === 13) {
          console.log("在标题处按下回车");
          document.getElementById("new_content").focus();
        }
      },
      deleteMe(ev) {
          console.log("delete me");
          console.log(ev);
          this.new_note.images.splice(ev, 1);
          this.editNoteImages();
      }
    },
    props: ["notes", "on_edit", "new_note", "role"],
    components: {
      "imageUnit": imageUnit,
    }
    //role: create/edit
  }
</script>
<style scoped>
  [contenteditable=true]:empty:before {
    content: attr(placeholder);
    display: block; /* For Firefox */
  }

  /* */

  div[contenteditable=true] {
    /*border: 1px dashed #AAA;*/
    /*width: 290px;*/
    padding: 5px;
  }

  pre {
    background: #EEE;
    padding: 5px;
    /*width: 290px;*/
  }

  .tool-enter-active {
    transition: opacity .7s
  }

  .tool-leave-active {
    transition: opacity 0s
  }

  .tool-enter, .tool-leave-active {
    opacity: 0
  }

  .image-form {
    display: none;
    height: 0px;
  }

  .delete-image {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background-color: transparent;
    border-radius: 3px;
  }

  .multi-images {
    padding: 10px;
  }
</style>
