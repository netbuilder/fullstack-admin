<template>
    <main class="form-signin w-100 m-auto text-center">
      <form v-if="!passwordResetSuccess" @submit.prevent="resetPassword">
        <h1 class="h1 mb-4 fw-normal fw-bold">Full Stack Test</h1>
        <h3 class="h2 mb-3 fw-normal">Készítette: Szabó János</h3>
        <h2 class="h3 mb-3 fw-normal my-2">Jelszó Visszaállítása</h2>
  
        <div class="form-floating my-2">
          <input type="password" class="form-control" id="password" placeholder="Új jelszó" v-model="password" required>
          <label for="password">Új jelszó</label>
        </div>
        <div class="form-floating my-2">
          <input type="password" class="form-control" id="confirmPassword" placeholder="Jelszó megerősítése" v-model="confirmPassword" required>
          <label for="confirmPassword">Jelszó megerősítése</label>
        </div>
  
        <button class="w-100 btn btn-lg btn-primary my-2" type="submit">Jelszó Visszaállítása</button>
        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      </form>
      <div v-else>
        <p>A jelszó sikeresen visszaállítva!</p>
        <router-link to="/login">Bejelentkezés</router-link>
      </div>
    </main>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        password: '',
        confirmPassword: '',
        error: null,
        passwordResetSuccess: false,
        token: this.$route.query.token 
      };
    },
    methods: {
      async resetPassword() {
        if (this.password !== this.confirmPassword) {
          this.error = 'A jelszavak nem egyeznek!';
          return;
        }
  
        try {
          const response = await axios.post('http://localhost:3000/reset-password', {
            password: this.password,
            token: this.token
          });
  
          console.log('Válasz a backend-től:', response.data);
          this.passwordResetSuccess = true;
  
        } catch (error) {
          this.error = 'Hiba a jelszó visszaállítása közben';
          console.error(error);
        }
      }
    }
  };
  </script>