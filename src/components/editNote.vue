<template>
  <div class="md-layout md-align-center" >
    <div class="md-card" style="outline: none;background-color: #fafafa" contenteditable="false">
      <md-card-header contenteditable="true" style="outline: none; font-size: large" placeholder="标题" id="title"
                      v-html="note.title">
      </md-card-header>
      <md-card-content contenteditable="true" style="outline: none;" placeholder="添加内容..." id="content"
                       v-html="note.content">
      </md-card-content>
      <div contenteditable="false" style="padding-left: 590px;">
      </div>
      <transition name="tool">
        <div class="md-layout">
          <div class="md-layout" md-flex="80">
            <md-button>
              <md-icon>
                alarm
              </md-icon>
              <md-tooltip md-direction="bottom">提醒</md-tooltip>
            </md-button>
            <md-button>
              <md-icon>
                photo
              </md-icon>
              <md-tooltip md-direction="bottom">添加图片</md-tooltip>
            </md-button>
            <md-button>
              <md-icon>
                share
              </md-icon>
              <md-tooltip md-direction="bottom">分享</md-tooltip>
            </md-button>
          </div>

          <div class="md-layyout" md-align="end">
            <md-button md-fab md-fab-bottom-right @click.native="modifyNote" class="md-primary">
              完成
            </md-button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {}
    },
    methods: {
      modifyNote() {
        console.log("modify note");
        this.note.title = $("#title").html();
        this.note.content = $("#content").html();
//        this.closeToggle = true;
        this.$emit('toggleClose');
      }
    },
    props: ["note", "on_edit", "closeToggle"]
  }
</script>
<style>

</style>
