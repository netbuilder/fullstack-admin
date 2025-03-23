<template>
  <div class="container">
    <h1>Új Termék</h1>
    <form @submit.prevent="createTermek">
      <div class="mb-3">
        <label for="nev" class="form-label">Név</label>
        <input type="text" class="form-control" id="nev" v-model="termek.nev" required>
      </div>
      <div class="mb-3">
        <label for="leiras" class="form-label">Leírás</label>
        <textarea class="form-control" id="leiras" v-model="termek.leiras"></textarea>
      </div>
      <div class="mb-3">
        <label for="ar" class="form-label">Ár</label>
        <input type="number" class="form-control" id="ar" v-model.number="termek.ar" required>
      </div>
      <div class="mb-3">
        <label for="kategoria" class="form-label">Kategória</label>
        <input type="text" class="form-control" id="kategoria" v-model="termek.kategoria">
      </div>
      <!-- Képfeltöltő mező hozzáadása -->
      <div class="mb-3">
        <label for="kep" class="form-label">Kép</label>
        <input type="file" class="form-control" id="kep" @change="onFileChange">
      </div>
      <button type="submit" class="btn btn-primary">Létrehozás</button>
      <button class="btn btn-secondary" @click="$router.push('/')">Vissza</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      termek: {
        nev: '',
        leiras: '',
        ar: null,
        kategoria: ''
      },
      file: null 
    };
  },
  methods: {
    onFileChange(e) {
      this.file = e.target.files[0]; 
    },
    async createTermek() {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('nev', this.termek.nev);
        formData.append('leiras', this.termek.leiras);
        formData.append('ar', this.termek.ar);
        formData.append('kategoria', this.termek.kategoria);
        if (this.file) {
            formData.append('kep', this.file);
        }

         await axios.post(
            'http://localhost:3000/termekek',
            formData,
            {
              headers: {
              'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
              }
            }
          );
     
        this.termek = {
          nev: '',
          leiras: '',
          ar: null,
          kategoria: ''
        };
        this.file = null; 

        this.$router.push('/');
        this.$emit('termek-created');

      } catch (error) {
       // console.error(error);
      
          if (error.response && error.response.data) {
              let message = error.response.data.message; 
              if (error.response.data.errors) {
                  // Ha vannak validációs hibák, azokat is hozzáadjuk az üzenethez
                  const errorMessages = Object.values(error.response.data.errors).join('\n');
                  message += '\n' + errorMessages;
              }
              alert(message); // Megjelenítjük az üzenetet
          } else {
              alert('Váratlan hiba történt!'); 
          }
      }

    }
  }
};
</script>