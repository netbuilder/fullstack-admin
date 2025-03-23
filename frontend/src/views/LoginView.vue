<template>
  <main class="form-signin container m-auto text-center">
    <form v-if="!showRegistrationForm && !showForgotPasswordForm" @submit.prevent="login">
      <h1 class="h1 mb-4 fw-normal fw-bold">Full Stack próbafeladat</h1>
      <h3 class="h2 mb-3 fw-normal text-primary">Készítette: Szabó János</h3>
      <h2 class="h3 mb-3 fw-normal my-2">Bejelentkezés</h2>
      <div class="form-floating my-2">
        <input type="text" class="form-control" id="username" placeholder="felhasználónév" v-model="username">
        <label for="username">Felhasználónév</label>
      </div>
      <div class="form-floating my-2">
        <input type="password" class="form-control" id="password" placeholder="Jelszó" v-model="password">
        <label for="password">Jelszó</label>
      </div>

      <button class="w-100 btn btn-lg btn-primary my-2" type="submit">Bejelentkezés</button>
      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      <a href="#" @click.prevent="showForgotPasswordForm = true">Elfelejtett jelszó?</a>
      <p class="mt-5 mb-3 text-body-secondary">Netbuilder©2025</p>
      <button class="w-100 btn btn-lg btn-secondary my-2" type="button" @click="showRegistrationForm = true">Regisztráció</button>
    </form>

    <!-- Jelszó visszaállítási űrlap -->
    <form v-else-if="showForgotPasswordForm && !showRegistrationForm" class="form-signin container m-auto text-center" @submit.prevent="requestPasswordReset">
      <h1 class="h1 mb-4 fw-normal fw-bold">Full Stack Test</h1>
      <h3 class="h2 mb-3 fw-normal">Készítette: Szabó János</h3>
      <h2 class="h3 mb-3 fw-normal my-2">Jelszó Visszaállítása</h2>

      <div class="form-floating my-2">
        <input type="email" class="form-control" id="email" placeholder="Email cím" v-model="email">
        <label for="email">Email cím</label>
      </div>

      <button class="w-100 btn btn-lg btn-primary my-2" type="submit">Jelszó visszaállítása</button>
      <button class="w-100 btn btn-lg btn-secondary my-2" type="button" @click="showForgotPasswordForm = false">Mégse</button>
      <div v-if="forgotPasswordError" class="alert alert-danger mt-3">{{ forgotPasswordError }}</div>
    </form>

    <form v-else class="form-signin container m-auto text-center" @submit.prevent="register">
      <h1 class="h1 mb-4 fw-normal fw-bold">Full Stack Test</h1>
      <h3 class="h2 mb-3 fw-normal">Készítette: Szabó János</h3>
      <h2 class="h3 mb-3 fw-normal my-2">Regisztráció</h2>

      <div class="form-floating my-2">
        <input type="text" class="form-control" id="vezeteknev" placeholder="Vezetéknév" v-model="regisztracio.vezeteknev" required>
        <label for="vezeteknev">Vezetéknév</label>
        <div v-if="registrationErrors.vezeteknev" class="text-danger">{{ registrationErrors.vezeteknev }}</div>
      </div>
      <div class="form-floating my-2">
        <input type="text" class="form-control" id="keresztnev" placeholder="Keresztnév" v-model="regisztracio.keresztnev" required>
        <label for="keresztnev">Keresztnév</label>
         <div v-if="registrationErrors.keresztnev" class="text-danger">{{ registrationErrors.keresztnev }}</div>
      </div>
      <div class="form-floating my-2">
        <input type="text" class="form-control" id="felhasznalonev" placeholder="Felhasználónév" v-model="regisztracio.felhasznalonev" required>
        <label for="felhasznalonev">Felhasználónév</label>
         <div v-if="registrationErrors.felhasznalonev" class="text-danger">{{ registrationErrors.felhasznalonev }}</div>
      </div>
      <div class="form-floating my-2">
        <input type="password" class="form-control" id="jelszo" placeholder="Jelszó" v-model="regisztracio.jelszo" required>
        <label for="jelszo">Jelszó</label>
         <div v-if="registrationErrors.jelszo" class="text-danger">{{ registrationErrors.jelszo }}</div>
      </div>
      <!-- E-mail mező hozzáadása -->
      <div class="form-floating my-2">
        <input type="email" class="form-control" id="email" placeholder="E-mail cím" v-model="regisztracio.email" required>
        <label for="email">E-mail cím</label>
         <div v-if="registrationErrors.email" class="text-danger">{{ registrationErrors.email }}</div>
      </div>
      <div class="form-floating my-2">
        <input type="text" class="form-control" id="szuletesi_hely" placeholder="Születési hely" v-model="regisztracio.szuletesi_hely">
        <label for="szuletesi_hely">Születési hely</label>
         <div v-if="registrationErrors.szuletesi_hely" class="text-danger">{{ registrationErrors.szuletesi_hely }}</div>
      </div>
      <div class="form-floating my-2">
        <input type="date" class="form-control" id="szuletesi_ido" placeholder="Születési idő" v-model="regisztracio.szuletesi_ido">
        <label for="szuletesi_ido">Születési idő</label>
         <div v-if="registrationErrors.szuletesi_ido" class="text-danger">{{ registrationErrors.szuletesi_ido }}</div>
      </div>
      <div class="form-floating my-2">
        <select class="form-control" id="nem" v-model="regisztracio.nem">
          <option value="Férfi">Férfi</option>
          <option value="Nő">Nő</option>
          <option value="Egyéb">Egyéb</option>
        </select>
        <label for="nem">Nem</label>
         <div v-if="registrationErrors.nem" class="text-danger">{{ registrationErrors.nem }}</div>
      </div>

      <button class="w-100 btn btn-lg btn-primary my-2" type="submit">Regisztráció</button>
      <button class="w-100 btn btn-lg btn-secondary my-2" type="button" @click="showRegistrationForm = false">Mégse</button>
      <div v-if="registrationError" class="alert alert-danger mt-3">{{ registrationError }}</div>
      <p class="mt-5 mb-3 text-body-secondary">Netbuilder©2025</p>
    </form>
  </main>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      email: '',
      error: null,
      showRegistrationForm: false,
      showForgotPasswordForm: false,
      regisztracio: {
        vezeteknev: '',
        keresztnev: '',
        felhasznalonev: '',
        jelszo: '',
        email: '',
        szuletesi_hely: '',
        szuletesi_ido: '',
        nem: ''
      },
      registrationError: null,
      forgotPasswordError: null,
      registrationErrors: {} 
    }
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
    localStorage.setItem('keresztnev', keresztnev);
    localStorage.setItem('vezeteknev', vezeteknev);

    // Felhasználónév és szerepkör tárolása
    localStorage.setItem('username', this.username);

    // Átirányítás az eredeti oldalra, ha van redirect paraméter
    const redirect = this.$route.query.redirect || '/';
    this.$router.push(redirect);

  } catch (error) {
    this.error = 'Hibás felhasználónév vagy jelszó';
    console.error(error);
  }
},
    async register() {
       this.registrationErrors = {}; // Töröljük az előző hibákat

      // Frontend validáció
      if (!this.validateRegistrationForm()) {
        return; // Ha nem valid, ne küldjük el
      }
      try {
        const regData = {
          ...this.regisztracio
        };
        if (!regData.szuletesi_ido) {
          regData.szuletesi_ido = null;
        }
        await axios.post('http://localhost:3000/register', regData);

        this.showRegistrationForm = false;
        this.regisztracio = {
          vezeteknev: '',
          keresztnev: '',
          felhasznalonev: '',
          jelszo: '',
          email: '',
          szuletesi_hely: '',
          szuletesi_ido: null,
          nem: ''
        };
        this.registrationError = null;

      } catch (error) {
        this.registrationError = 'Hiba a regisztráció során';
        console.error(error);
         // Backend validációs hiba kezelése
        if (error.response && error.response.status === 400 && error.response.data.errors) {
          this.registrationErrors = error.response.data.errors;
        } else {
          // Egyéb hiba kezelése
          console.error("Hiba a regisztráció során:", error);
          alert("Hiba a regisztráció során!");
        }
      }
    },

    async requestPasswordReset() {
      // 1. Validáció - frontend
      if (!this.email) {
        this.forgotPasswordError = 'Kérlek, add meg az e-mail címed!';
        return;
      }

      if (!this.isValidEmail(this.email)) {
        this.forgotPasswordError = 'Kérlek, érvényes e-mail címet adj meg!';
        return;
      }

      try {
        // 2. Backend hívás - itt jönne a POST /request-password-reset
        const response = await axios.post('http://localhost:3000/request-password-reset', {
          email: this.email
        });

        // 3. Backend válasz kezelése (alert)
        alert(response.data); // backend adja vissza az alert szövegét

        // Reset email mező és hibaüzenet
        this.email = '';
        this.forgotPasswordError = null;
        this.showForgotPasswordForm = false; // Vissza a bejelentkezés formra

      } catch (error) {
        this.forgotPasswordError = 'Hiba a jelszó visszaállítási kérelem elküldése közben';
        console.error(error);
      }
    },
    isValidEmail(email) {
      // Egyszerű email validáció
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    validateRegistrationForm() {
      let isValid = true;
      this.registrationErrors = {};

      if (!this.regisztracio.vezeteknev) {
        this.registrationErrors.vezeteknev = 'A vezetéknév megadása kötelező!';
        isValid = false;
      }

       if (!this.regisztracio.keresztnev) {
        this.registrationErrors.keresztnev = 'A keresztnév megadása kötelező!';
        isValid = false;
      }

      if (!this.regisztracio.felhasznalonev) {
        this.registrationErrors.felhasznalonev = 'A felhasználónév megadása kötelező!';
        isValid = false;
      }

      if (!this.regisztracio.jelszo) {
        this.registrationErrors.jelszo = 'A jelszó megadása kötelező!';
        isValid = false;
      }

      if (!this.regisztracio.email) {
        this.registrationErrors.email = 'Az email megadása kötelező!';
        isValid = false;
      } else if (!this.isValidEmail(this.regisztracio.email)) {
         this.registrationErrors.email = 'Érvénytelen email formátum!';
        isValid = false;
      }

      return isValid;
    }
  }
};
</script>

<style scoped>
.form-signin {
  max-width: 400px;
  padding: 15px;
}

.form-signin .form-floating:focus-within {
  z-index: 2;
}

.form-signin input[type="text"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>