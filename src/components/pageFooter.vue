<template>
    <div class="footer">
      <span class="content-left">
        一个在线memo
      </span>
      <span class="content-right">
        <a style="color: grey" href="https://zhangfeng.site">张锋</a>&nbsp|&nbsp<a href="https://github.com/SharpZhang/memo" style="color: grey">GitHub</a>
      </span>
    </div>
</template>
<script>
  export default {
    data() {
      return {}
    },
    props: [],

  }
</script>
<style>
  .footer {
    color: grey;
    margin-top: 15px;
    align-items: right;
    position: relative;
    bottom: 0px;
    margin-left: auto;
    margin-right: auto;
    width: 1300px;
    height: 50px;
    background-color: rgb(240, 240, 240);
  }

  .content-left {
    font-size: large;
    top:18px;
    position: absolute;
    left: 10px;
  }

  .content-right {
    font-size: large;
    top:18px;
    position: absolute;
    right: 10px;
  }
</style>
