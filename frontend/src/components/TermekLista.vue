<template>
  <div class="container">
    <h1>Saját termékeim</h1>
        <button class="btn btn-primary" @click="$router.push('/termekek/uj')">Új termék létrehozása</button>
    <table class="table">
      <thead>
        <tr>
          <th>Név</th>
          <th>Leírás</th>
          <th>Ár</th>
          <th>Kategória</th>
          <th>Kép</th>
          <th>Műveletek</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="termek in termekek" :key="termek.id">
          <td>{{ termek.nev }}</td>
          <td>{{ roviditettLeiras(termek.leiras) }}</td>
          <td>{{ termek.ar }}</td>
          <td>{{ termek.kategoria }}</td>
          <td>
            <img v-if="termek.kep_url" :src="termek.kep_url" alt="Termék képe" style="max-width: 50px; max-height: 50px;">
            <span v-else>Nincs kép</span>
          </td>
          <td>
            <button class="btn btn-sm btn-info" @click="megtekintTermeket(termek)">Megtekintés</button>
            <button class="btn btn-sm btn-warning" @click="editTermek(termek)">Módosítás</button>
            <button class="btn btn-sm btn-danger" @click="deleteTermek(termek)">Törlés</button>
          </td>
        </tr>
      </tbody>
    </table>
    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: aktualisOldal === 1 }">
          <a class="page-link" href="#" @click.prevent="aktualisOldal--">Előző</a>
        </li>
        <li class="page-item" :class="{ disabled: aktualisOldal >= osszesOldal }">
          <a class="page-link" href="#" @click.prevent="aktualisOldal++">Következő</a>
        </li>
      </ul>
    </nav>

    <!-- Módosító űrlap -->
    <div v-if="szerkesztendoTermek">
      <h2>Termék Módosítása</h2>
      <form @submit.prevent="updateTermek">
      <!-- ... (a korábbi kód) -->
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      termekek: [],
      aktualisOldal: 1,
      termekSzamOldalankent: 5,
      osszesTermekSzam: 0,
      szerkesztendoTermek: null
    };
  },
  computed: {
      osszesOldal() {
          return Math.ceil(this.osszesTermekSzam / this.termekSzamOldalankent);
      }
  },
  mounted() {
    this.getTermekek();
  },
  watch: {
      aktualisOldal() {
          this.getTermekek();
      }
  },
  methods: {
    megtekintTermeket(termek) {
      this.$router.push(`/termekek/${termek.id}`);
    },
    async getTermekek() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/termekek?page=${this.aktualisOldal}&limit=${this.termekSzamOldalankent}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.termekek = response.data;
        this.osszesTermekSzam = response.data.osszesTermekSzam;
      } catch (error) {
        console.error(error);
      }
    },

    editTermek(termek) {
      this.$router.push(`/termekek/${termek.id}/modositas`);
    },

    async updateTermek() {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3000/termekek/${this.szerkesztendoTermek.id}`, this.szerkesztendoTermek, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.getTermekek();
        this.szerkesztendoTermek = null;
      } catch (error) {
        console.error(error);
      }
    },
    async deleteTermek(termek) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/termekek/${termek.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.getTermekek();
      } catch (error) {
        console.error(error);
      }
    },
    roviditettLeiras(leiras) {
      if (leiras && leiras.length > 50) {
        return leiras.substring(0, 50) + '...';
      }
      return leiras;
    }

  }
};
</script>