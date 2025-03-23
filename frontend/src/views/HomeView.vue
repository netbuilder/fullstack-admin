<template>
  <div class="home">
    <TermekLista />
    <hr>
  </div>
</template>

<script>
import TermekLista from '../components/TermekLista.vue';

export default {
  components: {
    TermekLista,
  },
  methods: {
    frissitTermekListat() {
      this.$forceUpdate(); 
    }
  }
}
</script>