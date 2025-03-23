<template>
  <div class="container">
    <h1>Termékek</h1>
    <table class="table">
      <thead>
        <tr>
          <th class="col-md-2">Terméknév</th>
          <th class="col-md-2">
            Tulaj.,Rögz.,Mód.,Törölve
          </th>

          <th class="col-md-2">Leírás</th>
          <th class="col-md-1">Ár</th>
          <th class="col-md-1">Fotó</th>
          <th class="col-md-1">Termékkártya</th>
          <th class="col-md-1">Állapot</th>
          <th class="col-md-1">Műveletek</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="termek in termekek" :key="termek.id">
          <td>{{ termek.nev }}</td>
          <td>
            <span class="fw-bold">
              {{ termek.felhasznalonev }}
            </span><br>
            {{ termek.created_at ? formatDateTime(termek.created_at) : '--------' }}<br>
            {{ termek.updated_at ? formatDateTime(termek.updated_at) : '--------' }}<br>
            {{ termek.deleted_at ? formatDateTime(termek.deleted_at) : '--------' }}<br>
          </td>

          <td>{{ roviditettLeiras(termek.leiras) }}</td>
          <td>{{ termek.ar }}</td>
              <td>  <img v-if="termek.kep_url" :src="termek.kep_url" alt="Termék képe" style="max-width: 50px; max-height: 50px;">
            <span v-else>Nincs kép</span></td>
            <td>
              <button class="btn btn-sm btn-primary" @click="navigateToProduct(termek)">Termék Kártya</button>
            </td>
            <td>
            <button class="btn btn-sm disabled w-100" :class="termek.deleted_at ? 'btn-danger' : 'btn-success'">
              {{ termek.deleted_at ? 'Blokkolt' : 'Aktív' }}
            </button>
          </td>
          <td>
            <button class="btn btn-sm" :class="termek.deleted_at ? 'btn-success' : 'btn-danger'" @click="toggleTermekStatus(termek)">
              {{ termek.deleted_at ? 'Feloldás' : 'Blokkolás' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      termekek: []
    };
  },
  mounted() {
    this.getTermekek();
  },
  methods: {
     formatDateTime(dateTimeString) {
      if (!dateTimeString) {
        return '--------';
      }
      const dateTime = new Date(dateTimeString);
      const year = dateTime.getFullYear();
      const month = String(dateTime.getMonth() + 1).padStart(2, '0');
      const day = String(dateTime.getDate()).padStart(2, '0');
      const hours = String(dateTime.getHours()).padStart(2, '0');
      const minutes = String(dateTime.getMinutes()).padStart(2, '0');
      const seconds = String(dateTime.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    async getTermekek() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/admin/termekek', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.termekek = response.data;
      } catch (error) {
        console.error(error);
        alert('Hiba a termékek listázása során');
      }
    },
    async toggleTermekStatus(termek) {
      try {
        const token = localStorage.getItem('token');
       
        await axios.put(`http://localhost:3000/admin/termekek/${termek.id}/blokkol`,  { }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.getTermekek();
      } catch (error) {
        console.error(error);
        alert('Hiba a termék állapotának módosítása során');
      }
    },
    navigateToProduct(termek) {
      this.$router.push({ name: 'admin-termek-kartya', params: { id: termek.id } });
    },
    roviditettLeiras(leiras) {
      if (leiras && leiras.length > 80) {
        return leiras.substring(0, 80) + '...';
      }
      return leiras;
    },
  }
};
</script>