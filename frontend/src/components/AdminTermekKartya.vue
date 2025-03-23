<template>
    <div class="container">
      <h1>Admin - Termék Kártya</h1>
      <div v-if="termek" class="card">
        <h5 class="card-title text-primary fs-2 mx-auto">Termék neve : {{ termek.nev }}</h5>
        <img v-if="termek.kep_url" :src="termek.kep_url" class="card-img-top" alt="Termék képe">
        <div class="card-body">
          <h5 class="card-title">{{ termek.nev }}</h5>
          <p class="card-text">{{ termek.leiras }}</p>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">Ár: {{ termek.ar }}</li>
          <li class="list-group-item">Kategória: {{ termek.kategoria }}</li>
          <li class="list-group-item">Felhasználó: {{ termek.felhasznalonev }}</li>
          <li class="list-group-item">Rögzítve: {{ termek.created_at }}</li>
          <li class="list-group-item">Módosítva: {{ termek.updated_at }}</li>
          <li class="list-group-item">Állapot: {{ termek.deleted_at ? 'Inaktív' : 'Aktív' }}</li>
        </ul>
        <div class="card-body">
          <button class="btn btn-secondary" @click="$router.push('/admin/termekek/')">Vissza</button>
        </div>
      </div>
      <div v-else>
        <p>A termék nem található.</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        termek: null
      };
    },
    mounted() {
      this.getTermek();
    },
    methods: {
      async getTermek() {
        try {
          const token = localStorage.getItem('token');
          const termekId = this.$route.params.id; 
  
          const response = await axios.get(`http://localhost:3000/termekek/${termekId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
  
          this.termek = response.data;
        } catch (error) {
          console.error(error);
          this.termek = null; 
        }
      }
    }
  };
  </script>