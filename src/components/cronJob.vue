<template>

</template>
<script>
  import eventBus from './eventBus'
  import notificationHandler from './notificationHandler'
  export default {
    data() {
      return {
        interval: 10000
      }
    },
    methods: {},
    props: ["notes", "notes_ready"],
    created() {

    },
    watch: {
      notes_ready(newValue, oldValue) {
        if (newValue === true) {
          setInterval(() => {
//            console.log("notes数量：" + this.notes.length);
            //遍历notes,
            for (let i in this.notes) {
              if (this.notes[i].informTime !== "") {
                let now = new Date();
                let informTime = new Date(this.notes[i].informTime);
                let diff = Math.abs(now - informTime);
                if (diff < this.interval && this.notes[i].isInformed ==="false") {
                  console.log("相差：" + diff/1000 + "秒");
                  notificationHandler.showNotification("您有一条提醒", this.notes[i].title);
                  this.notes[i].isInformed = "true";
                  let data = new FormData();
                  data.append("isInformed", "true");
                  this.axios.post(this.GLOBAL.server_address + '/note/update/' + this.notes[i]._id, data)
                    .then((response) => {
                      console.log("设置提醒状态成功");
                      console.log(response);
//                      this.$emit("refreshThis");
                    })
                    .catch((e) => {
                      console.log('设置提醒状态失败');
                      console.log(e);
                    })
                }
              }
            }
//            console.log("--------------------loop-------------------------")

          }, this.interval)
        }
      }
    }
  }
</script>
<style>

</style>
