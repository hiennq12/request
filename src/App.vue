<template>
  <div>
    <h1>API Redirect Manager</h1>
    <RulesManager />


  </div>
</template>

<script>
// Import component RulesManager
import RulesManager from './components/RulesManager.vue';

export default {
  name: 'ApiRedirectManager',  // Tên component cha
  components: {
    RulesManager  // Đăng ký component con
  }
}




</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 10px;
  width: 300px;
}
</style>
