<template>
  <div class="md-layout md-alignment-top-center">
    <md-card
      id="note_form"
      v-on:click.native="openFull"
      tabindex="0">
      <md-card-area class="note-form-container">
        <div class="note-images">
          <md-card-media v-if="new_note.images.length"
                         class="image-unit-container"
                         :style="{'flex-basis': mounted ? image_flex_basis[index] : '100px', 'color': index >= 0 ? 'black' : 'white'}"
                         v-for="(image, index) in new_note.images"
                         :image_index="index"
                         :key="image">
            <!--控制删除按钮和进度条的显示消失-->
            <image-unit :src="(image_data[index] !== '') ? image_data[index] : image"
                        :data_src="image"
                        :done_uploading="done_uploading[index]"
                        :index="index"
                        v-on:deleteMe="deleteMe($event)">
            </image-unit>
          </md-card-media>
        </div>
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
               @blur="polishTitle()"
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
               @blur="polishContent()"
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
                       ref="image_input"
                       accept="image/*"
                       class="image-form"
                       v-on:change="onFileChange">
              </md-button>
              <md-button md-fab md-fab-bottom-right @click.native.stop="addOrEdit" class="md-primary">
                完成
              </md-button>
              <md-button md-fab md-fab-bottom-right @click.native.stop="rearrangeImages" class="md-primary">
                重排
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
  //  import parseQuery from 'query-string'
  import parseUrl from 'url-parse'
  import loadImage from 'image-promise'
  /**
   * 更改XMLHttpRequest原型，这样才能在error抛出的XMLHttpRequest中得到request的url
   */
  let xhrProto = XMLHttpRequest.prototype,
    origOpen = xhrProto.open;
  xhrProto.open = function (method, url) {
    this._url = url;
    return origOpen.apply(this, arguments);
  };

  export default {
    data () {
      return {
        new_list: {},
        image_data: [],
        image_flex_basis: [],
        done_uploading: [],
        have_file: false,
        snackbar_content: "",
        show_snackbar: false,
        mounted: false,
      }
    },
    props: ["notes", "new_note", "on_edit", "role"],
    components: {
      "imageUnit": imageUnit,
    },
    beforeMount() {
      this.done_uploading = new Array(this.new_note.images.length);
      this.image_data = new Array(this.new_note.images.length);
      for (let i = 0; i < this.new_note.images.length; i++) {
        this.done_uploading[i] = true;
        /**
         * 在 before mount 里面，所以不会导致 note 点击出来的 form 图片为空，更何况我更新了判断条件
         */
        this.image_data[i] = ''
      }
    },
    mounted() {
      console.log('mounted')
//      this.no_use=2
      this.mounted = true
      /**
       * mounted 为 true 时，image_flex_basis 仍然为空，此时rearrange并没有作用，因为取不到渲染完的 dom
       */
      this.rearrangeImages()
//      this.rearrangeImages()
//      let real_images = []
//      let imgs = []
//      for (let i in this.new_note.images) {
//        real_images[i] = (this.image_data[i] == '') ? this.new_note.images[i] : this.image_data[i]
//        imgs[i] = new Image()
//        imgs[i].src = real_images[i]
//        console.log('width: ' + imgs[i].width + ', height: ' + imgs[i].height)
//      }
    },
    watch: {
      'new_note.images': function (new_images) {
        console.log('set new_note.images')
        /**
         * 不能简单的使用setter，因为要求的是在set操作完成之后进行rearrange
         */
//        this.rearrangeImages()
      },
    },
    updated() {
      /**
       * 过于频繁，不在这使用
       */
      console.log('noteform updated')
//      this.rearrangeImages()
    },
    methods: {
      handlePaste(e) {
        e.preventDefault();
        let pastedText = undefined;
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
        let sel, range;
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
      polishTitle() {
        let title = this.$refs.title.querySelectorAll("div")
        while (title.length) {
          for (let item of title)
            item.outerHTML = item.innerHTML + "<br/>"
          title = this.$refs.title.querySelectorAll("div")
        }
      },
      polishContent() {
        let content = this.$refs.content.querySelectorAll("div")
//          console.log(content.length)
        while (content.length) {
          for (let item of content)
            item.outerHTML = item.innerHTML + "<br/>"
          content = this.$refs.content.querySelectorAll("div")
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
              this.addOrEdit()
            }
            this.on_edit = false
            $("html").off('click')
          }
//          else
//            console.log('jienei')
        })
      },
      addOrEdit() {
        /**
         * 为了方便硬性规定图片未上传完不可以更改 ：）
         */
        if (this.done_uploading.toString().indexOf('false') !== -1) {
          this.snackbar_content = "请等待图片上传完成";
          this.show_snackbar = true;
        }
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
        this.polishTitle()
        this.polishContent()
        if (this.$refs.title.innerHTML === "" && this.$refs.content.innerHTML === "" && this.new_note.images.length === 0) {
          return
        }
        this.new_note.type = "ordinary";
        this.new_note.title = this.$refs.title.innerHTML;
        this.new_note.content = this.$refs.content.innerHTML;
        //调用API，并且更新本地note
        let data = new FormData();
        //将数组转换成字符串
        /**
         * 神魔恋，这是什么鬼操作，上面的渲染还要用到这个变量呢
         */
//        this.new_note.images = this.new_note.images.toString();
        for (let key in this.new_note) {
//          console.log(key + ': ' + this.new_note[key]);
          if (key === "images") {
            data.append(key, this.new_note[key].toString());
          }
          else {
            data.append(key, this.new_note[key]);
          }
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
            this.$emit("refreshNotes");
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
      deleteNoteImages(index) {

      },
      updateNoteImages(index) {
        console.log('update note images');
        /**
         * 这里有一个问题，如果没上传完或者这个note压根就还没创建，API call会有错误，
         * 怎么破呢，这里也需要判断role
         * 是edit就发请求，是create就，就，就，直接删除就好了
         * 是edit也不能直接发请求，因为可能还在上传，哦不对，那个是更新，不涉及到image index
         */
        if (this.role === 'create') {
//          this.new_note.images.splice(index, 1);
//          this.image_data.splice(index, 1)
//          this.done_uploading.splice(index, 1)
//          this.snackbar_content = "更新图片成功";
//          this.show_snackbar = true;
        }
        else if (this.role === 'edit') {
          let data = new FormData();
          data.append('images', this.new_note.images.toString());
          this.axios.post(this.GLOBAL.server_address + '/note/update/' + this.new_note._id, data)
            .then((response) => {
              console.log('update image success');
              console.log(response);
//              this.new_note.images.splice(index, 1);
//              this.image_data.splice(index, 1)
//              this.done_uploading.splice(index, 1)
              this.snackbar_content = "更新图片成功";
              this.show_snackbar = true;
              //成功也不需要从远端获取新的数据
//            this.$emit("refreshThis");
//            this.$emit("toggleClose");
            })
            .catch((e) => {
              console.log('更新图片失败');
              this.snackbar_content = "更新图片失败" + e;
              //更新失败则增加回去，吗，不需要，会陷入循环
              this.show_snackbar = true;
            });
        }
      },
      uploadFile() {
//        console.log("you should upload file");
        this.$refs.image_input.click()
//        console.log("filename" + $("#image_input").val());
      },
      onFileChange() {
        console.log("file input changed");
        //当没选中图片时，清除预览
        if (this.$refs.image_input.files.length === 0) {
          console.log("no image selected")
//          this.have_file = false;
//          document.querySelector('#new_note_preview').src = '';
          return;
        }
        this.have_file = true;
        let reader = new FileReader();
        //读取选中的图片，并转换成dataURL格式
        reader.readAsDataURL(this.$refs.image_input.files[0]);
        reader.onload = (e) => {
          //读取完成，生成预览，加进度条，上传图片，去掉进度条
          this.done_uploading.push(false);
          //将读取出来的二进制数据赋给image_data，new_note.images只用于存链接
          //事实是image_data与new_note.images长度不一定一样，但是可以使他们一样
          /**
           * @todo 优化渲染过程
           * 这里 setter 被触发，进入渲染队列，界面会先显示出未 arrange 的图片，然后触发 updated 生命周期钩子
           * 随即触发 rearrange 方法，方法中修改 image_flex_basis，再次进入渲染队列，总觉得不应该分成两部来操作
           * 如果想要一次渲染完成需要在一个执行栈中完成 image_data 和 image_flex_basis 的修改
           * 现在是在一次执行栈中吗？不是，因为绑定了 updated 钩子
           * 绑定钩子的原因是，若直接 onload 之后就rearrange就得创建 image()，而image需要load，也就是说，不可能在同一个执行栈中，算是框架的缺点了。
           * 无法干涉 vue 内核的渲染过程，无法将在代码中创建的 img 对象给vue直接替换
           * 所以，很烦
           */
          let now_length = this.image_data.push(e.target.result)
          this.new_note.images.push('')
          //创建一个multipart请求
          let data = new FormData();
          data.append('note_image', this.$refs.image_input.files[0]);
          this.axios.post(this.GLOBAL.server_address + "/upload?seq=" + (now_length - 1), data)
            .then(response => {
              let seq = parseUrl(response.request.responseURL, true).query.seq
              console.log(seq)
              /**
               * 实际上不需要替换图片，直接保留就好了，用户体验也更好
               * 但还是要请求图片
               */
              this.new_note.images[seq] = response.data.filepath;
              console.log("图片上传成功: " + seq);
              console.log('onload image data rearrange')
              this.rearrangeImages()
              this.snackbar_content = "图片上传成功";
              this.done_uploading[seq] = true;
              this.show_snackbar = true;
              return this.axios.get(this.GLOBAL.server_address + response.data.filepath)
            })
            .then(response => {
              console.log('image data transferred')
            })
            .catch((e, config) => {
              console.log("图片上传失败，");
              console.log(e.request._url)
              let seq = parseUrl(e.request._url, true).query.seq
              console.log(seq)
//              let seq = parseQuery.parse(response.request.responseURL.substring(response.request.responseURL.indexOf("?"))).seq
              this.done_uploading.splice(seq, 1);
//              console.log(this.done_uploading);
              this.new_note.images.splice(seq, 1);
              this.image_flex_basis.splice(seq, 1)
              this.image_data.splice(seq, 1)
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
      deleteMe(index) {
        console.log("delete me: " + index);
        /**
         * 先进行本地操作
         */
        this.new_note.images.splice(index, 1);
        this.image_data.splice(index, 1)
        this.done_uploading.splice(index, 1)
        this.image_flex_basis.splice(index, 1)
        console.log('after delete rearrange')
        this.$nextTick(this.rearrangeImages)
        this.updateNoteImages(index);
      },
      rearrangeImages() {
        /**
         * 重排图片，使之适应宽度并且适当缩小
         * @param this.new_note this.image_data
         * 根据这两个来确定每三张一组的图片的缩放比例，也可以直接规定这一组的高度
         * 通过设置flex-basis来重新排列图片
         * 对于初始化状态，应当在vue更新dom之后进行操作
         */
        console.log('rearrange!!!!!!!!!!!')
        let real_images = []
        let imgs = []
        let row_height = []
        let container_width = 0
        if (this.role === 'create') {
          container_width = window.getComputedStyle(this.$el.querySelector("#note_form")).width
        } else if (this.role === 'edit') {
          container_width = window.getComputedStyle(this.$el).width
        }
        container_width = parseInt(container_width.substring(0, container_width.length - 2))
//        console.log(this.$el.querySelector("#note_form>.note-form-container>.note-images>[image_index='0']>.img-unit>img"))
//        console.log(this.$el.querySelector("#note_form>.note-form-container>.note-images>[image_index='1']>.img-unit>img"))
        console.log('container width: ' + container_width)
        /**
         * 倒序
         */
        console.log('have ' + this.new_note.images.length + ' images now')
        for (let i in this.new_note.images) {
//          let len = this.new_note.images.length - 1
          real_images[i] = (this.image_data[i] == '') ? this.new_note.images[i] : this.image_data[i]
          /**
           * 用这个就注定无法异步渲染完成
           */
          imgs[i] = this.$el.querySelector("#note_form>.note-form-container>.note-images>[image_index='" + i + "']>.img-unit>img")
//          imgs[i].internal_index = i
//          imgs[i].src = real_images[i]
//          imgs[i].onload = e => {
//            console.log('loaded')
//            console.log(e.target.internal_index)
//          }
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
            this.image_flex_basis[i - 2] = w1 + 'px'
            this.image_flex_basis[i - 1] = w2 + 'px'
            this.image_flex_basis[i] = w3 + 'px'
//            document.querySelector("[image_index='" + (i - 2) + "']").style['flex-basis'] = w1 + 'px'
//            document.querySelector("[image_index='" + (i - 1) + "']").style['flex-basis'] = w2 + 'px'
//            document.querySelector("[image_index='" + i + "']").style['flex-basis'] = w3 + 'px'
//            console.log('calculated height: ' + h)
//            console.log('w1: ' + w1)
//            console.log('w2: ' + w2)
//            console.log('w3: ' + w3)
          }
          else if (i == (this.new_note.images.length - 1)) {
            if ((i + 1) % 3 === 1) {
              /**
               * 这里需要注意如果大于 container_width 则直接设置为 container_width，其实可以直接设置为 container_width
               */
//              let h = imgs[i].height
//              row_height.push(h)
//              let w1 = h * imgs[i].width / imgs[i].height
              this.image_flex_basis[i] = container_width + 'px'
//              document.querySelector("[image_index='" + i + "']").style['flex-basis'] = w1 + 'px'
//              console.log('remains one image height: ' + h)
            }
            else if ((i + 1) % 3 === 2) {
              let h = container_width / (imgs[i - 1].naturalWidth / imgs[i - 1].naturalHeight + imgs[i].naturalWidth / imgs[i].naturalHeight)
              row_height.push(h)
              let w1 = h * imgs[i - 1].naturalWidth / imgs[i - 1].naturalHeight
              let w2 = h * imgs[i].naturalWidth / imgs[i].naturalHeight
              this.image_flex_basis[i - 1] = w1 + 'px'
              this.image_flex_basis[i] = w2 + 'px'
//              document.querySelector("[image_index='" + (i - 1) + "']").style['flex-basis'] = w1 + 'px'
//              document.querySelector("[image_index='" + i + "']").style['flex-basis'] = w2 + 'px'
//              console.log('remains one image height: ' + h)
            }
          }
        }
        console.log('rearrange results')
        console.log(this.image_flex_basis)
      }
      ,
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

  .note-images {
    display: flex;
    flex-wrap: wrap;
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

  .image-unit-container {
    /*padding: 10px;*/
  }

  @media only screen and (max-width: 700px) {
    #note_form {
      width: 100%;
    }

    .note-form-container {
      width: 100%;
    }
  }
</style>
