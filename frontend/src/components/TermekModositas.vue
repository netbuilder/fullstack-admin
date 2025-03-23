<template>
  <div class="container">
    <h1>Termék Módosítása</h1>
    <form @submit.prevent="updateTermek">
      <div class="mb-3">
        <label for="nev" class="form-label">Név</label>
        <input type="text" class="form-control" id="nev" v-model="form.nev" required>
        <div v-if="errors.nev" class="text-danger">{{ errors.nev }}</div>
      </div>
      <div class="mb-3">
        <label for="leiras" class="form-label">Leírás</label>
        <textarea class="form-control" id="leiras" v-model="form.leiras"></textarea>
        <div v-if="errors.leiras" class="text-danger">{{ errors.leiras }}</div>
      </div>
      <div class="mb-3">
        <label for="ar" class="form-label">Ár</label>
        <input type="number" class="form-control" id="ar" v-model.number="form.ar" required>
        <div v-if="errors.ar" class="text-danger">{{ errors.ar }}</div>
      </div>
      <div class="mb-3">
        <label for="kategoria" class="form-label">Kategória</label>
        <input type="text" class="form-control" id="kategoria" v-model="form.kategoria">
        <div v-if="errors.kategoria" class="text-danger">{{ errors.kategoria }}</div>
      </div>

      <div v-if="form.kep_url" class="text-center">
        <div class="row text-center">
          <img :src="form.kep_url" class="img-thumbnail m-auto" alt="Termék Képe" style="max-width: 500px;">
        </div>
        <button class="btn btn-danger my-2" @click.prevent="deleteImage">Kép törlése</button>
      </div>
      <div v-else class="mb-3">
        <label for="kep" class="form-label">Kép</label>
        <input type="file" class="form-control" id="kep" @change="onFileChange">
      </div>
      <hr>
      <div class="row">
        <div class="col-md-6 text-center">
          <button type="submit" class="btn btn-primary">Módosítás</button>
        </div>
        <div class="col-md-6 text-center">
          <button class="btn btn-secondary text-end" @click.prevent="vallyBackToProducts">Mégse</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      form: {
        nev: '',
        leiras: '',
        ar: null,
        kategoria: '',
        kep_url: ''
      },
      file: null,
      errors: {}
    };
  },
  mounted() {
    this.getProfile();
  },
  methods: {
    onFileChange(e) {
      this.file = e.target.files[0];
    },
    async getProfile() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/termekek/${this.$route.params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.form = response.data;
      } catch (error) {
        console.error(error);
        this.$router.push('/');
      }
    },
    async updateTermek() {
      this.errors = {}; 

      // Frontend validáció
      if (!this.validateForm()) {
        return; // Ha nem valid, ne küldjük el
      }

      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('nev', this.form.nev);
        formData.append('leiras', this.form.leiras);
        formData.append('ar', this.form.ar);
        formData.append('kategoria', this.form.kategoria);
        if (this.file) {
          formData.append('kep', this.file);
        }

        await axios.put(`http://localhost:3000/termekek/${this.$route.params.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });

        this.$router.push('/');

      } catch (error) {
        console.error(error);
        // Backend validációs hiba kezelése
        if (error.response && error.response.status === 400 && error.response.data.errors) {
          this.errors = error.response.data.errors;
        } else {
          // Egyéb hiba kezelése
          console.error("Hiba a termék módosítása során:", error);
          alert("Hiba a termék módosítása során!");
        }
      }
    },
    vallyBackToProducts() {
      this.$router.push('/')
    },
    async deleteImage() {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3000/termekek/${this.$route.params.id}/kep/torles`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.getProfile();

      } catch (err) {
        console.error(err);
        //  this.errors = err.response.data.errors
      }
    },
    validateForm() {
      let isValid = true;
      this.errors = {};

      if (!this.form.nev) {
        this.errors.nev = 'A név megadása kötelező!';
        isValid = false;
      }

      if (!this.form.ar) {
        this.errors.ar = 'Az ár megadása kötelező!';
        isValid = false;
      } else if (this.form.ar <= 0) {
        this.errors.ar = 'Az ár nem lehet nulla vagy negatív!';
        isValid = false;
      }

      return isValid;
    }
  }
};
</script>