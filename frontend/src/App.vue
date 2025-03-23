<template>
  <div v-if="isLoggedIn">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <router-link to="/" class="navbar-brand">Full Stack Test</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">Saját Termékeim</router-link>
            </li>
            <li class="nav-item dropdown" v-if="isAdmin">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Admin
              </a>
              <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><router-link to="/admin/users" class="dropdown-item">Felhasználók (Rendszerszinten)</router-link></li>
                <li><router-link to="/admin/termekek" class="dropdown-item">Termékek (Rendszerszinten)</router-link></li>
                <li><router-link to="/admin/statisztikak" class="dropdown-item">Statisztikák</router-link></li>
              </ul>
            </li>
          </ul>
          <span class="navbar-text">
            <span v-if="vezeteknev && keresztnev">{{ vezeteknev }} {{ keresztnev }} bejelentkezve</span> <span v-if="isAdmin">[Admin]</span>
          </span>
          <ul class="navbar-nav">
            <li class="nav-item">
              <a href="#" class="nav-link" @click="logout">Kijelentkezés</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
  <router-view v-else />
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      isLoggedIn: localStorage.getItem('token') ? true : false,
      isAdmin: false,
      vezeteknev: localStorage.getItem('vezeteknev') || '',
      keresztnev: localStorage.getItem('keresztnev') || '',
      password: '',
      error: null,
      isLoggingOut: false
    };
  },
  watch: {
    $route() {
      this.isLoggedIn = localStorage.getItem('token') ? true : false;
      this.isAdmin = this.getIsAdmin();
      this.vezeteknev = localStorage.getItem('vezeteknev') || '';
      this.keresztnev = localStorage.getItem('keresztnev') || '';
    }
  },
  created() {
    this.isAdmin = this.getIsAdmin();

    axios.interceptors.request.use(config => {
      if (this.isLoggingOut) {
        return Promise.reject('Kijelentkezés folyamatban, kérés megszakítva.');
      }
      return config;
    });
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('http://localhost:3000/login', {
          felhasznalonev: this.username,
          jelszo: this.password
        });

        const token = response.data.token;
        const vezeteknev = response.data.vezeteknev;
        const keresztnev = response.data.keresztnev;

        localStorage.setItem('token', token);
        localStorage.setItem('vezeteknev', vezeteknev);
        localStorage.setItem('keresztnev', keresztnev);

        this.isLoggedIn = true;
        this.isAdmin = this.getIsAdmin();
        this.$router.push('/');
      } catch (error) {
        this.error = 'Hibás felhasználónév vagy jelszó';
        console.error(error);
      }
    },
    logout() {
      this.isLoggingOut = true;
      localStorage.removeItem('token');
      localStorage.removeItem('vezeteknev');
      localStorage.removeItem('keresztnev');
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.vezeteknev = '';
      this.keresztnev = '';
      this.$router.push('/login')
        .finally(() => {
          this.isLoggingOut = false;
        });
    },
    getIsAdmin() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.szerepkor === 'Admin';
        } catch (e) {
          console.error('Érvénytelen JWT token', e);
          return false;
        }
      }
      return false;
    }
  }
};
</script>