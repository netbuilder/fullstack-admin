<template>
    <div class="container">
      <h1>Profil</h1>
      <div v-if="profile">
        <p>Üdvözöljük, {{ profile.message }}!</p>
      </div>
      <div v-else>
        <p>Betöltés...</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        profile: null
      }
    },
    mounted() {
      this.getProfile();
    },
    methods: {
      async getProfile() {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:3000/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
  
          this.profile = response.data;
        } catch (error) {
          console.error(error);
          this.$router.push('/login');
        }
      },
      logout() {
        localStorage.removeItem('token'); // Token törlése
        this.$router.push('/login'); // Átirányítás a bejelentkezési oldalra
      }
    }
  }
  </script>