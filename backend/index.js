const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const cloudinary = require('cloudinary').v2;
const multer  = require('multer');
const streamifier = require('streamifier');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const speakeasy = require('speakeasy');

const formatDates = (req, res, next) => {
    if (res.rows && Array.isArray(res.rows)) {
        res.rows.forEach(row => {
            if (row.created_at) {
                row.created_at = new Date(row.created_at).toLocaleDateString('hu-HU');
            }
            if (row.updated_at) {
                row.updated_at = new Date(row.updated_at).toLocaleDateString('hu-HU');
            }
        });
    } else if (res.rows && !Array.isArray(res.rows))
    {
         if (res.rows.created_at) {
                res.rows.created_at = new Date(res.rows.created_at).toLocaleDateString('hu-HU');
            }
            if (res.rows.updated_at) {
                res.rows.updated_at = new Date(res.rows.updated_at).toLocaleDateString('hu-HU');
            }
    }
    next();
};

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET; 

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'fullstack_db',
    password: 'loginiscorrect',
    port: 5432,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });
  
  const storage = multer.memoryStorage()
  const upload = multer({ storage: storage })




// Middleware a JWT token hitelesítéséhez
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // "Bearer <token>"

        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403); 
            }

            req.user = user;

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                req.user.id = payload.id;
                req.user.szerepkor = payload.szerepkor;

            } catch (e) {
                console.error("Hiba van");
                return res.sendStatus(403);
            }

            next(); 
        });
    } else {
        res.sendStatus(401); 
    }
};

// Middleware az adminisztrátori jogosultságok ellenőrzéséhez
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.szerepkor === 'Admin') {
      next();
    } else {
      res.status(403).send('Nincs jogosultságod ehhez a művelethez!');
    }
  };

/**
 * @swagger
 * components:
 *   schemas:
 *     Felhasznalo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: A felhasználó azonosítója
 *           example: 1
 *         vezeteknev:
 *           type: string
 *           description: A felhasználó vezetékneve
 *           example: Teszt
 *         keresztnev:
 *           type: string
 *           description: A felhasználó keresztneve
 *           example: Elek
 *         felhasznalonev:
 *           type: string
 *           description: A felhasználó felhasználóneve
 *           example: tesztelek
 *         jelszo:
 *           type: string
 *           description: A felhasználó jelszava (hash-elt)
 *           example: $2b$10$EXAMPLE_HASHED_PASSWORD
 *         email:
 *           type: string
 *           description: A felhasználó e-mail címe
 *           example: teszt@example.com
 *         szuletesi_hely:
 *           type: string
 *           description: A felhasználó születési helye
 *           example: Budapest
 *         szuletesi_ido:
 *           type: string
 *           format: date
 *           description: A felhasználó születési ideje
 *           example: 1990-01-01
 *         nem:
 *           type: string
 *           description: A felhasználó neme
 *           example: Férfi
 *         szerepkor:
 *           type: string
 *           description: A felhasználó szerepköre
 *           example: Felhasználó
 *         status:
 *           type: integer
 *           description: A felhasználó státusza (1 = aktív, 0 = inaktív)
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date
 *           description: A létrehozás dátuma
 *           example: 2024-01-01
 *         updated_at:
 *           type: string
 *           format: date
 *           description: A frissítés dátuma
 *           example: 2024-01-02
 *         password_reset_token:
 *           type: string
 *           nullable: true
 *           description: A jelszó visszaállítási token
 *           example: null
 *         password_reset_expires:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: A jelszó visszaállítási token lejárati ideje
 *           example: null
 *     Termek:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: A termék azonosítója
 *           example: 1
 *         felhasznalo_id:
 *           type: integer
 *           description: A terméket létrehozó felhasználó azonosítója
 *           example: 1
 *         nev:
 *           type: string
 *           description: A termék neve
 *           example: Teszt Termék
 *         leiras:
 *           type: string
 *           description: A termék leírása
 *           example: Ez egy teszt termék.
 *         ar:
 *           type: number
 *           format: float
 *           description: A termék ára
 *           example: 99.99
 *         kategoria:
 *           type: string
 *           description: A termék kategóriája
 *           example: Teszt Kategória
 *         kep_url:
 *           type: string
 *           nullable: true
 *           description: A termék képének URL-je
 *           example: https://example.com/kep.jpg
 *         created_at:
 *           type: string
 *           format: date
 *           description: A termék létrehozásának dátuma
 *           example: 2024-01-01
 *         updated_at:
 *           type: string
 *           format: date
 *           description: A termék frissítésének dátuma
 *           example: 2024-01-02
 *         deleted_at:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: A termék törlésének dátuma (ha törölték)
 *           example: null
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */




/**
 * @swagger
 * /:
 *   get:
 *     summary: Hello World!
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Sikeres válasz.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hello World!
 */

app.get('/', (req, res) => {
    res.send('Hello World!');
});


/**
 * @swagger
 * /dbtest:
 *   get:
 *     summary: Teszteli az adatbázis kapcsolatot.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Sikeres adatbázis kapcsolat.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Current time from database: 2024-01-01T12:00:00.000Z"
 *       500:
 *         description: Hiba az adatbázis kapcsolódás során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Error connecting to database
 */


app.get('/dbtest', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        const currentTime = result.rows[0].now;
        client.release();

        res.send(`Current time from database: ${currentTime}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error connecting to database');
    }
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Regisztrál egy új felhasználót.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vezeteknev:
 *                 type: string
 *                 example: Teszt
 *               keresztnev:
 *                 type: string
 *                 example: Elek
 *               felhasznalonev:
 *                 type: string
 *                 example: tesztelek
 *               jelszo:
 *                 type: string
 *                 example: jelszo123
 *               email:
 *                 type: string
 *                 example: teszt@example.com
 *               szuletesi_hely:
 *                 type: string
 *                 example: Budapest
 *               szuletesi_ido:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               nem:
 *                 type: string
 *                 example: Férfi
 *     responses:
 *       201:
 *         description: Sikeres regisztráció.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Felhasznalo'
 *       400:
 *         description: Validációs hiba.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validációs hiba!
 *                 errors:
 *                   type: object
 *                   example:
 *                     email: Ez az email cím már regisztrálva van!
 *       500:
 *         description: Hiba a regisztráció során.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hiba a regisztráció során
 */
// Végpont a regisztrációhoz
app.post('/register', async (req, res) => {
    try {
        const { vezeteknev, keresztnev, felhasznalonev, jelszo, email, szuletesi_hely, szuletesi_ido, nem } = req.body;

        // Backend validáció
        const errors = {};
        if (!vezeteknev) {
            errors.vezeteknev = 'A vezetéknév megadása kötelező!';
        }
        if (!keresztnev) {
            errors.keresztnev = 'A keresztnév megadása kötelező!';
        }
        if (!felhasznalonev) {
            errors.felhasznalonev = 'A felhasználónév megadása kötelező!';
        }
        if (!jelszo) {
            errors.jelszo = 'A jelszó megadása kötelező!';
        }
        if (!email) {
            errors.email = 'Az email megadása kötelező!';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.email = 'Érvénytelen email formátum!';
        }

        // Ellenőrizzük, hogy az email cím már létezik-e
        let client0 = await pool.connect();
        let emailCheckResult = await client0.query(
            'SELECT id FROM felhasznalok WHERE email = $1',
            [email]
        );
        client0.release();

        if (emailCheckResult.rows.length > 0) {
            errors.email = 'Ez az email cím már regisztrálva van!';
        }

        // Ellenőrizzük, hogy a felhasználónév már létezik-e
        let client1 = await pool.connect();
        let felhasznalonevCheckResult = await client1.query(
            'SELECT id FROM felhasznalok WHERE felhasznalonev = $1',
            [felhasznalonev]
        );
        client1.release();

        if (felhasznalonevCheckResult.rows.length > 0) {
            errors.felhasznalonev = 'Ez a felhasználónév már foglalt!';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: 'Validációs hiba!', errors: errors });
        }

        const hashedPassword = await bcrypt.hash(jelszo, 10);

        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO felhasznalok (vezeteknev, keresztnev, felhasznalonev, jelszo, email, szuletesi_hely, szuletesi_ido, nem) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [vezeteknev, keresztnev, felhasznalonev, hashedPassword, email, szuletesi_hely, szuletesi_ido || null, nem]
        );
        client.release();

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Hiba a regisztráció során' });
    }
});

/**
 * @swagger
 * /request-password-reset:
 *   post:
 *     summary: Jelszó visszaállítási kérelem indítása.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: teszt@example.com
 *     responses:
 *       200:
 *         description: Sikeres kérelem. A visszaállítási link a console-ban jelenik meg.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Jelszó visszaállítási kérelem elküldve!
 *       400:
 *         description: Érvénytelen e-mail cím.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Kérlek, add meg az e-mail címed!
 *       404:
 *         description: A felhasználó nem található.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: A felhasználó nem található
 *       500:
 *         description: Hiba a jelszó visszaállítási kérelem feldolgozása során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a jelszó visszaállítási kérelem feldolgozása során
 */

app.post('/request-password-reset', async (req, res) => {
    try {
        const { email } = req.body;

        // **Backend e-mail validáció!
        if (!email) {
            return res.status(400).send('Kérlek, add meg az e-mail címed!');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send('Kérlek, érvényes e-mail címet adj meg!');
        }

        // Ellenőrizzük, hogy a felhasználó létezik-e az adatbázisban
        const client = await pool.connect();
        const result = await client.query(
            'SELECT * FROM felhasznalok WHERE email = $1',
            [email]
        );
        client.release();

        const user = result.rows[0];

        if (!user) {
            return res.status(404).send('A felhasználó nem található');
        }

        // Jelszó visszaállítási token generálása
        const passwordResetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 órára állítottma

        // Token tárolása az adatbázisban
        const client2 = await pool.connect();
        await client2.query(
            'UPDATE felhasznalok SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
            [passwordResetToken, passwordResetExpires, user.id]
        );
        client2.release();

        // Visszaállítási link létrehozása
        const resetLink = `http://localhost:8080/reset-password?token=${passwordResetToken}`;

        // Itt majd az e-mailt küldjük el, ez most nincs megcsinálva még.
        console.log('Visszaállítási link:', resetLink);
        console.log('Jelszó visszaállítási kérelem elküldve erre az email címre:', email);
        console.log('Jelszó visszaállítási token:', passwordResetToken);
        

        res.send('Jelszó visszaállítási kérelem elküldve! EZ a link: '+resetLink);
    } catch (err) {
        console.error(err);
        res.status(500).send('Hiba a jelszó visszaállítási kérelem feldolgozása során');
    }
});

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Új jelszó beállítása a jelszó visszaállítási token segítségével.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: UjJelszo123
 *               token:
 *                 type: string
 *                 example: 1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
 *     responses:
 *       200:
 *         description: Sikeres jelszó visszaállítás.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Jelszó sikeresen visszaállítva!
 *       400:
 *         description: Érvénytelen vagy lejárt token.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Érvénytelen vagy lejárt token
 *       500:
 *         description: Hiba a jelszó visszaállítása során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a jelszó visszaállítása során
 */

// Végpont az új jelszó fogadásához és mentéséhez
app.post('/reset-password', async (req, res) => {
    try {
        const { password, token } = req.body;

        // Ellenőrizzük, hogy a token érvényes-e
        const client = await pool.connect();
        const result = await client.query(
            'SELECT * FROM felhasznalok WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
            [token]
        );
        client.release();

        const user = result.rows[0];

        if (!user) {
            return res.status(400).send('Érvénytelen vagy lejárt token');
        }

        // Jelszó hash-elése
        const hashedPassword = await bcrypt.hash(password, 10);

        // Jelszó mentése az adatbázisban
        const client2 = await pool.connect();
        await client2.query(
            'UPDATE felhasznalok SET jelszo = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
            [hashedPassword, user.id]
        );
        client2.release();

        res.send('Jelszó sikeresen visszaállítva!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Hiba a jelszó visszaállítása során');
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Bejelentkezés a rendszerbe.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               felhasznalonev:
 *                 type: string
 *                 example: tesztelek
 *               jelszo:
 *                 type: string
 *                 example: jelszo123
 *               totp_code:
 *                 type: string
 *                 example: "123456"
 *                 description: A 2FA kód, ha engedélyezve van.
 *     responses:
 *       200:
 *         description: Sikeres bejelentkezés.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IlVzZXIiLCJpYXQiOjE2NzcwMzM0NDcsImV4cCI6MTY3NzAzNzQ0N30.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *                 vezeteknev:
 *                   type: string
 *                   example: Teszt
 *                 keresztnev:
 *                   type: string
 *                   example: Elek
 *       401:
 *         description: Hibás felhasználónév vagy jelszó.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hibás felhasználónév vagy jelszó
 *       500:
 *         description: Hiba a bejelentkezés során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a bejelentkezés során
 */

// Új végpont a bejelentkezéshez
app.post('/login', async (req, res) => {
    try {
        const { felhasznalonev, jelszo, totp_code } = req.body;

        const client = await pool.connect();
        const result = await client.query(
            'SELECT id, felhasznalonev, jelszo, szerepkor, vezeteknev, keresztnev, status, totp_secret, totp_enabled FROM felhasznalok WHERE felhasznalonev = $1',
            [felhasznalonev]
        );
        client.release();

        const user = result.rows[0];

        if (!user) {
            return res.status(401).send('Hibás felhasználónév vagy jelszó');
        }

        // Ellenőrizzük a felhasználó status mezőt
        if (user.status !== 1) {
            return res.status(401).send('Ez a felhasználó inaktív!');
        }

        const passwordMatch = await bcrypt.compare(jelszo, user.jelszo);

        if (!passwordMatch) {
            return res.status(401).send('Hibás felhasználónév vagy jelszó');
        }

        // 2FA ellenőrzése, ha be van kapcsolva, de ez még csak részben van kész!!!!!!!!!!
        if (user.totp_enabled) {
            if (!totp_code) {
                return res.status(400).send('Kérlek add meg a 2FA kódot!');
            }

            const verified = speakeasy.totp.verify({
                secret: user.totp_secret,
                encoding: 'base32',
                token: totp_code,
                window:1
            });

            if (!verified) {
                return res.status(401).send('Hibás 2FA kód!');
            }
        }

        // JWT token létrehozása
        const token = jwt.sign({ id: user.id, szerepkor: user.szerepkor,vezeteknev: user.vezeteknev,keresztnev:user.keresztnev }, jwtSecret, { expiresIn: '1h' });

        res.json({
            token,
            vezeteknev: user.vezeteknev,
            keresztnev: user.keresztnev
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Hiba a bejelentkezés során');
    }
});

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Felhasználói profil lekérdezése (védett végpont).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Üdvözöljük a profil oldalon, 123 azonosítójú felhasználó!
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       403:
 *         description: Jogosultsági hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Forbidden
 */

// Védett végpont - User profile
app.get('/profile', authenticateJWT, (req, res) => {
  res.json({ message: `Üdvözöljük a profil oldalon, ${req.user.id} azonosítójú felhasználó!` });
});


/**
 * @swagger
 * /termekek:
 *   post:
 *     summary: Új termék létrehozása (védett végpont).
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nev:
 *                 type: string
 *                 example: Új Termék
 *               leiras:
 *                 type: string
 *                 example: Ez egy új termék leírása.
 *               ar:
 *                 type: number
 *                 format: float
 *                 example: 199.99
 *               kategoria:
 *                 type: string
 *                 example: Elektronika
 *               kep:
 *                 type: string
 *                 format: binary
 *                 description: A termék képe (opcionális).
 *     responses:
 *       201:
 *         description: Sikeres létrehozás.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 42
 *       400:
 *         description: Validációs hiba.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validációs hiba!
 *                 errors:
 *                   type: object
 *                   example:
 *                     nev: A név megadása kötelező!
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       500:
 *         description: Hiba a termék létrehozása során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a termék létrehozása során
 */

app.post('/termekek', authenticateJWT,upload.single('kep'), async (req, res) => {
    try {
        const { nev, leiras, ar, kategoria } = req.body;
        const felhasznalo_id = req.user.id; // A hitelesített felhasználó azonosítója

        // Backend validáció
        const errors = {};
        if (!nev) {
            errors.nev = 'A név megadása kötelező!';
        }
        if (!ar) {
            errors.ar = 'Az ár megadása kötelező!';
        } else if (isNaN(ar) || parseFloat(ar) <= 0) {
            errors.ar = 'Az ár érvénytelen!';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: 'Validációs hiba!', errors: errors });
            
        }

        let kep_url ="";
        if (!req.file) {
             const client = await pool.connect();
            const result = await client.query(
                'INSERT INTO termekek (felhasznalo_id, nev, leiras, ar, kategoria) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [felhasznalo_id, nev, leiras, ar, kategoria]
            );
            client.release();
         res.status(201).json({ id: result.rows[0].id });
            return;
          //  return res.status(400).send('Kérlek tölts fel egy képet!');
        }

        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function uploadToCloudinary(req) {
            let result = await streamUpload(req);
         //   console.log(result)
            return result;
        }

        const cloudinaryResult = await uploadToCloudinary(req);
       
        if (cloudinaryResult)
        {
         kep_url = cloudinaryResult.secure_url;
        }
            
        const client2 = await pool.connect();
        const result = await client2.query(
            'INSERT INTO termekek (felhasznalo_id, nev, leiras, ar, kategoria,kep_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [felhasznalo_id, nev, leiras, ar, kategoria,kep_url]
        );
        client2.release();

        res.status(201).json({id: result.rows[0].id }); // Csak az ID-t adjuk vissza
    } catch (err) {
        console.error(err);
        res.status(500).send('Hiba a termék létrehozása során');
    }
});

/**
 * @swagger
 * /termekek/{id}/kep:
 *   put:
 *     summary: Termék képének frissítése (védett végpont).
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A termék azonosítója
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               kep:
 *                 type: string
 *                 format: binary
 *                 description: A termék új képe.
 *     responses:
 *       200:
 *         description: "Sikeres frissítés."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secure_url:
 *                   type: string
 *                   example: https://example.com/uj_kep.jpg
 *                   description: Visszaadja a feltöltött kép URL-jét.
 *       400:
 *         description: Kérlek tölts fel egy képet!
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Kérlek tölts fel egy képet!
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       404:
 *          description: A termék nem található vagy nem a felhasználóhoz tartozik
 *          content:
 *            text/plain:
 *              schema:
 *                type: string
 *                example: A termék nem található vagy nem a felhasználóhoz tartozik
 *       500:
 *         description: Hiba a kép feltöltése során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a kép feltöltése során
 */

// 2. lépés: kép feltöltése és a termék frissítése
app.put('/termekek/:id/kep', authenticateJWT, upload.single('kep'), async (req, res) => {
    try {
        const { id } = req.params;
        const felhasznalo_id = req.user.id;

        if (!req.file) {
            return res.status(400).send('Kérlek tölts fel egy képet!');
        }

        //Ellenőrizzük, hogy a termék a felhasználóhoz tartozik-e
        const checkResult = await pool.connect();
         const checkUserTermek = await client.query(
            'SELECT * FROM termekek WHERE id = $1 AND felhasznalo_id = $2 AND deleted_at IS NULL',
            [id, felhasznalo_id]
        );

        if (checkUserTermek.rows.length === 0)
        {
            client.release()
            return res.status(404).send('A termék nem található vagy nem a felhasználóhoz tartozik');
        }

        client.release();

        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function uploadToCloudinary(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        const cloudinaryResult = await uploadToCloudinary(req);
            let kep_url ="";
            if (cloudinaryResult)
            {
            kep_url = cloudinaryResult.secure_url;
            }

        const client2 = await pool.connect();
        await client2.query(
            'UPDATE termekek SET kep_url = $1 WHERE id = $2',
            [kep_url, id]
        );
        client2.release();

        res.json({ secure_url: kep_url }); // Visszaadjuk a kép URL-jét
    } catch (err) {
        console.error(err);
        res.status(500).send('Hiba a kép feltöltése során');
    }
});

/**
 * @swagger
 * /termekek/{id}/kep/torles:
 *   put:
 *     summary: Termék képének törlése (védett végpont).
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A termék azonosítója
 *     responses:
 *       200:
 *         description: Sikeres törlés.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: A termék képe sikeresen törölve!
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       404:
 *         description: A termék nem található vagy nem a felhasználóhoz tartozik.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: A termék nem található vagy nem a felhasználóhoz tartozik
 *       500:
 *         description: Hiba a termék adatainak módosítása során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a termék adatainak módosítása során
 */

app.put('/termekek/:id/kep/torles', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const felhasznalo_id = req.user.id;

                //Ellenőrizzük, hogy a termék a felhasználóhoz tartozik-e
        const client0 = await pool.connect();
                const checkUserTermek = await client0.query(
            'SELECT * FROM termekek WHERE id = $1 AND felhasznalo_id = $2 AND deleted_at IS NULL',
            [id, felhasznalo_id]
        );
        if (checkUserTermek.rows.length === 0)
        {
            client0.release()
            return res.status(404).send('A termék nem található vagy nem a felhasználóhoz tartozik');
        }

        client0.release();

            
        const client = await pool.connect();
        await client.query(
            'UPDATE termekek SET kep_url = null WHERE id = $1 and felhasznalo_id=$2',
            [id,felhasznalo_id]
        );
        client.release();
        res.json({ message: 'A termék képe sikeresen törölve!' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Hiba a termék adatainak módosítása során');
    }
});

/**
 * @swagger
 * /termekek:
 *   get:
 *     summary: Termékek listázása (védett végpont).
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Az oldal száma (opcionális).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Termékek száma oldalanként (opcionális).
 *     responses:
 *       200:
 *         description: Sikeres listázás.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Termek'
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       500:
 *         description: Hiba a termékek listázása során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a termékek listázása során
 */

// Végpont a termékek listázásához (védett végpont)
app.get('/termekek', authenticateJWT, async (req, res) => {
    try {
        const felhasznalo_id = req.user.id; // A hitelesített felhasználó azonosítója
        const page = parseInt(req.query.page) || 1; // Aktuális oldal száma
        const limit = parseInt(req.query.limit) || 10; // Termékek száma oldalanként
        const offset = (page - 1) * limit; // Offset számítása

        const client = await pool.connect();

        // Először lekérdezzük az összes termék számát
        const countResult = await client.query(
            'SELECT COUNT(*) FROM termekek WHERE felhasznalo_id = $1 AND deleted_at IS NULL',
            [felhasznalo_id]
        );
        const osszesTermekSzam = parseInt(countResult.rows[0].count);

        const result = await client.query(
            `SELECT id, nev, leiras, ar, kategoria, kep_url FROM termekek 
             WHERE felhasznalo_id = $1 AND deleted_at IS NULL 
             ORDER BY nev 
             LIMIT $2 OFFSET $3`,
            [felhasznalo_id, limit, offset]
        );
        client.release();

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Hiba a termékek listázása során');
    }
});

/**
 * @swagger
 * /termekek/{id}:
 *   put:
 *     summary: Termék módosítása (védett végpont).
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A termék azonosítója
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nev:
 *                 type: string
 *                 example: Módosított Termék
 *               leiras:
 *                 type: string
 *                 example: Ez egy módosított termék leírása.
 *               ar:
 *                 type: number
 *                 format: float
 *                 example: 299.99
 *               kategoria:
 *                 type: string
 *                 example: Szórakozás
 *               kep:
 *                 type: string
 *                 format: binary
 *                 description: A termék új képe (opcionális).
 *     responses:
 *       200:
 *         description: Sikeres módosítás.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Termek'
 *       400:
 *         description: Validációs hiba.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validációs hiba!
 *                 errors:
 *                   type: object
 *                   example:
 *                     nev: A név megadása kötelező!
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       404:
 *         description: A termék nem található.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: A termék nem található
 *       500:
 *         description: Hiba a termék módosítása során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a termék módosítása során
 */


app.put('/termekek/:id', authenticateJWT,upload.single('kep'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nev, leiras, ar, kategoria } = req.body;
        const felhasznalo_id = req.user.id;

        // Backend validáció
        const errors = {};
        if (!nev) {
            errors.nev = 'A név megadása kötelező!';
        }
        if (!ar) {
            errors.ar = 'Az ár megadása kötelező!';
        } else if (isNaN(ar) || parseFloat(ar) <= 0) {
            errors.ar = 'Az ár érvénytelen!';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: 'Validációs hiba!', errors: errors });
        }

        const client = await pool.connect();

        // Ellenőrizzük, hogy a termék a felhasználóhoz tartozik-e
        const checkResult = await client.query(
            'SELECT * FROM termekek WHERE id = $1 AND felhasznalo_id = $2 AND deleted_at IS NULL',
            [id, felhasznalo_id]
        );

        if (checkResult.rows.length === 0) {
            client.release();
            return res.status(404).send('A termék nem található, vagy nem tartozik a felhasználóhoz');
        }
 let kep_url = null
            // Először ellenőrizzük, hogy a termék a felhasználóhoz tartozik-e
            if (req.file)
             {
                      let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        async function uploadToCloudinary(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
         const cloudinaryResult = await uploadToCloudinary(req);
       
        if (cloudinaryResult)
        {
         kep_url = cloudinaryResult.secure_url;
        }
             }



        // Frissítjük a termék adatait (a képet is)
        const result = await client.query(
            'UPDATE termekek SET nev = $1, leiras = $2, ar = $3, kategoria = $4,kep_url=$7, updated_at = NOW() WHERE id = $5 AND felhasznalo_id = $6 AND deleted_at IS NULL RETURNING *',
            [nev, leiras, ar, kategoria, id, felhasznalo_id,kep_url]
        );
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).send('A termék nem található');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Hiba a termék módosítása során');
    }
});

/**
 * @swagger
 * /termekek/{id}:
 *   delete:
 *     summary: Termék törlése (védett végpont).
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A termék azonosítója
 *     responses:
 *       200:
 *         description: Sikeres törlés.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: A termék sikeresen törölve!
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       404:
 *         description: A termék nem található.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: A termék nem található
 *       500:
 *         description: Hiba a termék törlése során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a termék törlése során
 */


// Végpont a termék törléséhez (védett végpont)
app.delete('/termekek/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params; // Termék azonosítója
        const felhasznalo_id = req.user.id; // A hitelesített felhasználó azonosítója

        const client = await pool.connect();

        // Először ellenőrizzük, hogy a termék a felhasználóhoz tartozik-e
        const checkResult = await client.query(
            'SELECT * FROM termekek WHERE id = $1 AND felhasznalo_id = $2 AND deleted_at IS NULL',
            [id, felhasznalo_id]
        );

        if (checkResult.rows.length === 0) {
             client.release();
             return res.status(404).send('A termék nem található, vagy nem tartozik a felhasználóhoz');
        }

        const result = await client.query(
            'UPDATE termekek SET deleted_at = NOW() WHERE id = $1 AND felhasznalo_id = $2 RETURNING *',
            [id, felhasznalo_id]
        );
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).send('A termék nem található');
        }

        res.json({ message: 'A termék sikeresen törölve!' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Hiba a termék törlése során');
    }
});

/**
 * @swagger
 * /termekek/{id}:
 *   get:
 *     summary: Termék lekérdezése (védett végpont).
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A termék azonosítója
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Termek'
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       404:
 *         description: A termék nem található.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: A termék nem található
 *       500:
 *         description: Hiba a termék lekérdezése során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a termék lekérdezése során
 */

// Végpont egy termék lekérdezéséhez (védett végpont)
app.get('/termekek/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const felhasznalo_id = req.user.id;

        const client = await pool.connect();
        const result = await client.query(
            `SELECT termekek.*, felhasznalonev
             FROM termekek
             INNER JOIN felhasznalok ON termekek.felhasznalo_id = felhasznalok.id
             WHERE termekek.id = $1 AND termekek.felhasznalo_id = $2`,
            [id, felhasznalo_id]
        );
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).send('A termék nem található');
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hiba a termék lekérdezése során');
    }
});




// Adminisztrátori végpontok innen kezdődnek:

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Felhasználók listázása (adminisztrátori végpont).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sikeres listázás.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Felhasznalo'
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       403:
 *         description: Jogosultsági hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Nincs jogosultságod ehhez a művelethez!
 *       500:
 *         description: Hiba a felhasználók listázása során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a felhasználók listázása során
 */


// Felhasználók listázása
app.get('/admin/users', authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, felhasznalonev, email, szerepkor, status FROM felhasznalok order by felhasznalonev');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hiba a felhasználók listázása során');
    }
});

/**
 * @swagger
 * /admin/termekek:
 *   get:
 *     summary: Termékek listázása (adminisztrátori végpont).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sikeres listázás.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Termek'
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       403:
 *         description: Jogosultsági hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Nincs jogosultságod ehhez a művelethez!
 *       500:
 *         description: Hiba a termékek listázása során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a termékek listázása során
 */

// Termékek listázása
// Adminisztrátori végpontok
// Termékek listázása
app.get('/admin/termekek', authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query(`
        SELECT termekek.*, felhasznalonev
             FROM termekek
             INNER JOIN felhasznalok ON termekek.felhasznalo_id = felhasznalok.id
        ORDER BY nev 
        `);
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hiba a termékek listázása során');
    }
});

/**
 * @swagger
 * /admin/users/{id}/status:
 *   put:
 *     summary: Felhasználó blokkolása/aktiválása (adminisztrátori végpont).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A felhasználó azonosítója
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 example: 0
 *                 description: A felhasználó új státusza (1 = aktív, 0 = inaktív)
 *     responses:
 *       200:
 *         description: Sikeres módosítás.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: A felhasználó állapota sikeresen módosítva!
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       403:
 *         description: Jogosultsági hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Nincs jogosultságod ehhez a művelethez!
 *       500:
 *         description: Hiba a felhasználó állapotának módosítása során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a felhasználó állapotának módosítása során
 */

// Felhasználó blokkolása/aktiválása
app.put('/admin/users/:id/status', authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Az új status értékét a kérés törzséből kapjuk
        const client = await pool.connect();
        await client.query('UPDATE felhasznalok SET status = $1 WHERE id = $2', [status, id]);
        client.release();
        res.json({ message: `A felhasználó állapota sikeresen módosítva!` });
    } catch (error) {
        console.error(error);
        res.status(500).send('Hiba a felhasználó állapotának módosítása során');
    }
});

/**
 * @swagger
 * /admin/users/{id}/role:
 *   put:
 *     summary: Felhasználó szerepkörének módosítása (adminisztrátori végpont).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A felhasználó azonosítója
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               szerepkor:
 *                 type: string
 *                 example: Admin
 *                 description: A felhasználó új szerepköre
 *     responses:
 *       200:
 *         description: Sikeres módosítás.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: A felhasználó szerepköre sikeresen módosítva!
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       403:
 *         description: Jogosultsági hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Nincs jogosultságod ehhez a művelethez!
 *       500:
 *         description: Hiba a felhasználó szerepkörének módosítása során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a felhasználó szerepkörének módosítása során
 */

// Felhasználó szerepkörének módosítása
app.put('/admin/users/:id/role', authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { szerepkor } = req.body; // Az új szerepkör értékét a kérés törzséből kapjuk
        const client = await pool.connect();
        await client.query('UPDATE felhasznalok SET szerepkor = $1 WHERE id = $2', [szerepkor, id]);
        client.release();
        res.json({ message: `A felhasználó szerepköre sikeresen módosítva!` });
    } catch (error) {
        console.error(error);
        res.status(500).send('Hiba a felhasználó szerepkörének módosítása során');
    }
});

/**
 * @swagger
 * /admin/termekek/{id}/blokkol:
 *   put:
 *     summary: Termék blokkolása/aktiválása (adminisztrátori végpont).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A termék azonosítója
 *     responses:
 *       200:
 *         description: Sikeres módosítás.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: A termék állapota sikeresen módosítva!
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       403:
 *         description: Jogosultsági hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Nincs jogosultságod ehhez a művelethez!
 *       404:
 *         description: A termék nem található.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: A termék nem található
 *       500:
 *         description: Hiba a termék blokkolása során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a termék blokkolása során
 */

// Termék blokkolása
app.put('/admin/termekek/:id/blokkol', authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
         const felhasznalo_id = req.user.id; // A hitelesített felhasználó azonosítója

        const client = await pool.connect();
        // Ellenőrizzük, hogy a termék a felhasználóhoz tartozik-e
        const checkResult = await client.query(
            'SELECT * FROM termekek WHERE id = $1',
            [id]
        );

       if (checkResult.rows.length == 0) {
             client.release();
             return res.status(404).send('A termék nem található');
        }


        await client.query('UPDATE termekek SET deleted_at = CASE WHEN deleted_at IS NULL THEN NOW() ELSE NULL END WHERE id = $1', [id]);
        client.release();
        res.json({ message: 'A termék állapota sikeresen módosítva!' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Hiba a termék blokkolása során');
    }
});

/**
 * @swagger
 * /admin/statisztikak:
 *   get:
 *     summary: Statisztikák lekérdezése (adminisztrátori végpont).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 regisztraltFelhasznalok:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       datum:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-01"
 *                       szam:
 *                         type: integer
 *                         example: 10
 *                         description: Regisztrált felhasználók száma
 *                 ujTermekek:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       datum:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-01"
 *                       szam:
 *                         type: integer
 *                         example: 5
 *                         description: Új termékek száma
 *                 aktivTermekek:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       datum:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-01"
 *                       szam:
 *                         type: integer
 *                         example: 3
 *                         description: Aktív termékek száma
 *       401:
 *         description: Hitelesítési hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       403:
 *         description: Jogosultsági hiba.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Nincs jogosultságod ehhez a művelethez!
 *       500:
 *         description: Hiba a statisztikák lekérdezése során.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hiba a statisztikák lekérdezése során
 */

app.get('/admin/statisztikak', authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        const client = await pool.connect();

        // Regisztrált felhasználók száma (időrendben - elmúlt 7 nap)
        const usersResult = await client.query(`
            SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as datum, COUNT(*) as szam
            FROM felhasznalok
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)
        `);

        // Új termékek száma (időrendben - elmúlt 7 nap)
        const termekekResult = await client.query(`
            SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as datum, COUNT(*) as szam
            FROM termekek
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)
        `);

        // Aktív termékek száma (időrendben - elmúlt 7 nap)
        const aktivTermekekResult = await client.query(`
            SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as datum, COUNT(*) as szam
            FROM termekek
            WHERE created_at >= NOW() - INTERVAL '7 days' and deleted_at IS NULL
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)
        `);

        client.release();

        res.json({
            regisztraltFelhasznalok: usersResult.rows,
            ujTermekek: termekekResult.rows,
            aktivTermekek: aktivTermekekResult.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Hiba a statisztikák lekérdezése során');
    }
});

// Swagger konfiguráció (a hiba elkerülése végett a swaggerOptions-t itt definiáljuk)
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Fullstack Alkalmazás API',
            version: '1.0.0',
            description: 'Dokumentáció a Fullstack alkalmazás API-jához'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }],
    },
    apis: ['./index.js'], // Az összes útvonalat tartalmazó fájl
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});