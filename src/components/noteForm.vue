<template>
  <div class="md-layout md-alignment-top-center">
    <md-card
      id="note_form"
      v-on:click.native="openFull"
      tabindex="0">
      <md-card-area id="note_form_container">
        <md-card-media v-if="new_note.images.length"
                       class="multi-images"
                       v-for="(image, index) in new_note.images"
                       :index="index"
                       :key="image">
          <!--控制删除按钮和进度条的显示消失-->
          <image-unit :src="image" :done_uploading="done_uploading" v-on:deleteMe="deleteMe($event)"
                      :index="index"></image-unit>
        </md-card-media>
        <md-card-content style="padding: 6px 6px 0px 6px;">
          <!--新记事标题与内容-->
          <!--v-on:keyup.enter="switchToContent"-->
          <div contenteditable="true"
               style="font-size: large; outline: none; margin-left: 5px; margin-top: 5px; white-space: pre-wrap;"
               placeholder="标题"
               id="new_title"
               v-on:keydown.enter.prevent="pressTab($event)"
               ref="title"
               tabindex="1"
               @paste="handlePaste($event)"
               @blur="polishContent($event)"
               v-html="new_note.title">
          </div>

          <div contenteditable="true"
               role="textbox"
               style="outline: none; margin-left: 5px; white-space: pre-wrap;"
               placeholder="添加内容..."
               id="new_content"
               ref="content"
               tabindex="2"
               @paste="handlePaste($event)"
               @blur="polishContent($event)"
               v-html="new_note.content">
          </div>
          <div contenteditable="false" style="padding-left: 590px;">
          </div>
          <transition name="editing">
            <md-card-actions v-show="on_edit">
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
              <md-button md-fab md-fab-bottom-right @click.native.stop="addOrEdit" class="md-primary">
                完成
              </md-button>
            </md-card-actions>
          </transition>
        </md-card-content>

      </md-card-area>
      <md-snackbar ref="snackbar" :md-active.sync="show_snackbar" style="background-color: #448aff; color: white;">
        <span>{{snackbar_content}}</span>
        <md-button class="md-accent" md-theme="light-blue" @click="show_snackbar = false" style="color: white;">已阅
        </md-button>
      </md-snackbar>
    </md-card>
  </div>
</template>
<script>
  import $ from "jquery";
  import imageUnit from './imageUnit'
  export default {
    data () {
      return {
        new_list: {},
        image_data: [],
        done_uploading: [],
        have_file: false,
        snackbar_content: "",
        show_snackbar: false,
//        on_edit: false
      }
    },
    beforeMount() {
      this.done_uploading = new Array(this.new_note.images.length);
      for (let i = 0; i < this.new_note.images.length; i++) {
        this.done_uploading[i] = true;
      }
    },
    methods: {
      handlePaste(e) {
        e.preventDefault();
        var pastedText = undefined;
        if (window.clipboardData && window.clipboardData.getData) { // IE
          pastedText = window.clipboardData.getData('Text');
        } else if (e.clipboardData && e.clipboardData.getData) {
          pastedText = e.clipboardData.getData('text/plain');
        }
        let texts = pastedText.split('\n')
        for (let i in texts) {
          this.insertLine(texts[i])
        }
        return false;
      },
      insertLine(text) {
        var sel, range;
        if (window.getSelection && (sel = window.getSelection()).rangeCount) {
          range = sel.getRangeAt(0);
          range.collapse(true);
          let div = document.createElement("div");
          div.appendChild(document.createTextNode(text));
          range.insertNode(div);
          range.setStartAfter(div);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      },
      polishContent(e) {
        /**
         * @todo 在这里使用id获取能够成功的原因是默认情况下new note form在所有notes之前，
         * 点开note的dialog，html的位置在new note form之前，
         * 替代方式是原本打算使用的e.target
         */
        console.log(e.target.id)
        if (e.target.id === 'new_content') {
          //polish content
          let content = document.querySelectorAll("#new_content > div")
          console.log(content.length)
          while (content.length) {
            for (let item of content)
              item.outerHTML = item.innerHTML + "<br/>"
            content = document.querySelectorAll("#new_content > div")
          }
        }
        else if (e.target.id === 'new_title') {
          //polish title
          let title = document.querySelectorAll("#new_title > div")
          console.log(title.length)
          while (title.length) {
            for (let item of content)
              item.outerHTML = item.innerHTML + "<br/>"
            title = document.querySelectorAll("#new_title > div")
          }
        }
        else {
          // invoke before adding note
          // polish both
          let content = document.querySelector("#new_content")
          let title = document.querySelector("#new_title")
        }
      },
      openFull(e) {
        if (this.on_edit === true)
          return
        console.log("open editor");
        this.on_edit = true
        $("html").on('click', e => {
          if ($(e.target).closest(".md-snackbar").length !== 0) {
            //点到snackbar了,不做操作
//            console.log('in snackbar')
            return
          }
          if ($(e.target).closest("#note_form").length === 0) {
            console.log('jiewai')
            if (this.$refs.title.innerHTML !== '' || this.$refs.content.innerHTML !== '' || this.new_note.images.length !== 0) {
//              console.log('not empty')
              /**
               * @todo should polish content and then add
               */
              this.polishContent(e)
              this.addNote()
            }
            this.on_edit = false
            $("html").off('click')
          }
//          else
//            console.log('jienei')
        })
      },
      addOrEdit() {
        if (this.role === "create") {
          console.log('should add note')
          this.addNote();
        }
        else if (this.role === "edit") {
          console.log('should edit note')
          this.editNote();
        }
      },
      addNote() {
//        console.log(this.$refs.title.innerHTML);
//        console.log(this.$refs.content.innerHTML);
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
          console.log(key + ': ' + this.new_note[key]);
          data.append(key, this.new_note[key]);
        }
        data.set("createdAt", new Date().toLocaleString());
        data.set("updatedAt", new Date().toLocaleString());
        this.axios.post(this.GLOBAL.server_address + '/note', data)
          .then((response) => {
            if (response.data.result.ok === 1) {
              console.log('插入数据成功，更新数据');
              console.log(response);
              this.$emit("refreshNotes");
              this.snackbar_content = "创建成功";
              this.show_snackbar = true;
              this.new_note.type = "";
              this.new_note.title = "";
              this.new_note.content = "";
              this.new_note.images = [];
              this.image_data = [];
              this.$refs.title.innerHTML = '';
              this.$refs.content.innerHTML = '';
            }
          })
          .catch((e) => {
            console.log('插入数据发生错误');
            console.log(e);
            this.snackbar_content = "插入数据发生错误" + e;
            this.show_snackbar = true;
          });
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
            this.show_snackbar = true;
            this.$emit("refreshThis");
            this.$emit("toggleClose");
          })
          .catch((e) => {
            console.log('modify failed');
            this.snackbar_content = "modify failed" + e;
            this.show_snackbar = true;
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
            this.show_snackbar = true;
//            this.$emit("refreshThis");
//            this.$emit("toggleClose");
          })
          .catch((e) => {
            console.log('modify failed');
            this.snackbar_content = "modify failed" + e;
            this.show_snackbar = true;
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
              this.show_snackbar = true;
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
              this.show_snackbar = true;
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
    props: ["notes", "new_note", "on_edit", "role"],
    components: {
      "imageUnit": imageUnit,
    }
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

  .editing-enter-active {
    transition: opacity .7s
  }

  .editing-leave-active {
    transition: opacity 0s
  }

  .editing-enter, .editing-leave-active {
    opacity: 0
  }

  .image-form {
    display: none;
    height: 0px;
  }

  #note_form {
    width: 600px;
    background-color: #fafafa;
    outline: none;
    display: flex;
    /*max-height: 800px;*/
    overflow: visible;
  }

  .multi-images {
    padding: 10px;
  }

  @media only screen and (max-width: 700px) {
    #note_form {
      width: 100%;
    }

    #note_form_container {
      width: 100%;
    }
  }
</style>
