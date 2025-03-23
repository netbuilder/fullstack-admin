--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-03-24 00:17:40

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 16421)
-- Name: schema; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA schema;


ALTER SCHEMA schema OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: felhasznalok; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.felhasznalok (
    id integer NOT NULL,
    vezeteknev character varying(255) NOT NULL,
    keresztnev character varying(255) NOT NULL,
    felhasznalonev character varying(255) NOT NULL,
    jelszo character varying(255) NOT NULL,
    szuletesi_hely character varying(255),
    szuletesi_ido date,
    nem character varying(20),
    szerepkor character varying(20) DEFAULT 'User'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    email character varying(255),
    password_reset_token character varying(255),
    password_reset_expires timestamp with time zone,
    status integer DEFAULT 1,
    totp_secret character varying(255),
    totp_enabled boolean DEFAULT false
);


ALTER TABLE public.felhasznalok OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16388)
-- Name: felhasznalok_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.felhasznalok_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.felhasznalok_id_seq OWNER TO postgres;

--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 218
-- Name: felhasznalok_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.felhasznalok_id_seq OWNED BY public.felhasznalok.id;


--
-- TOC entry 221 (class 1259 OID 16404)
-- Name: termekek; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.termekek (
    id integer NOT NULL,
    felhasznalo_id integer,
    nev character varying(255) NOT NULL,
    leiras text,
    ar numeric NOT NULL,
    kategoria character varying(255),
    kep_url character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


ALTER TABLE public.termekek OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16403)
-- Name: termekek_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.termekek_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.termekek_id_seq OWNER TO postgres;

--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 220
-- Name: termekek_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.termekek_id_seq OWNED BY public.termekek.id;


--
-- TOC entry 4748 (class 2604 OID 16392)
-- Name: felhasznalok id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.felhasznalok ALTER COLUMN id SET DEFAULT nextval('public.felhasznalok_id_seq'::regclass);


--
-- TOC entry 4754 (class 2604 OID 16407)
-- Name: termekek id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.termekek ALTER COLUMN id SET DEFAULT nextval('public.termekek_id_seq'::regclass);


--
-- TOC entry 4911 (class 0 OID 16389)
-- Dependencies: 219
-- Data for Name: felhasznalok; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.felhasznalok (id, vezeteknev, keresztnev, felhasznalonev, jelszo, szuletesi_hely, szuletesi_ido, nem, szerepkor, created_at, updated_at, deleted_at, email, password_reset_token, password_reset_expires, status, totp_secret, totp_enabled) FROM stdin;
3	Szabó	János	netbuilder	$2b$10$buSvfqaMLFI3N3YbAw1Rm.UJpGeVksep2iE6bZuhtGs901sFOcHTy	Debrecen	1973-02-01	Férfi	Admin	2025-03-21 19:22:19.332917+01	2025-03-21 19:22:19.332917+01	\N	netbuilder1973@gmail.com	75fe6148222233ed946bc770c4875d7b3f151846d011251c51e6296110ba8965	2025-03-23 22:55:29.955+01	1	\N	f
1	TesztVezeteknev	TesztKeresztnev	tesztfelhasznalo	$2b$10$csRTWB6e8FrXnJKJDb.0z.Bvj0xrvK3aU9GJoohOBzxi8EU5vaEQS	Tesztváros	1990-01-01	Férfi	User	2025-03-21 17:20:56.998437+01	2025-03-21 17:20:56.998437+01	2025-03-21 21:47:53.195125+01	aa@aa.hu	\N	\N	1	\N	f
4	Próba	Elek	proba	$2b$10$sZ/CkrzFD18TzOAI0lu5NuJ1Kdv9s93HifWdVtSRl3KxVH1glw3eO	Debrecen	2025-03-05	Férfi	User	2025-03-21 20:17:21.743076+01	2025-03-21 20:17:21.743076+01	2025-03-21 21:47:05.732198+01	bb@bb.hu	\N	\N	1	\N	f
6	Szabó	Gábor	szabogabor	$2b$10$eLyMdVYFkG/eZb6tmoV32Op0l0l2f7HPg2YK9P8oWHDiFYYfZlhV6		\N		User	2025-03-21 22:54:38.702798+01	2025-03-21 22:54:38.702798+01	\N	g.sabo847@gmail.com	\N	\N	1	\N	f
5	Gipsz	Jakab	gipsz	$2b$10$6Nh7DxaUA7FBtDRlW0Umzetc3HLmBkMFuN3i24BJbNVxwplqa8v4q	Miskolc	2006-02-09		User	2025-03-21 20:22:43.668235+01	2025-03-21 20:22:43.668235+01	2025-03-21 21:48:32.425048+01	cc@cc.hu	\N	\N	1	\N	f
9	Kis	imre	kiss	$2b$10$qf/XkC5zwL1n1jvXGjc.qOIVY4dCfhF3cdMgkGHwoWFb0V3pTIbyW	Budapest	2025-03-13	Férfi	User	2025-03-23 18:42:29.689998+01	2025-03-23 18:42:29.689998+01	\N	kiss@kiss.hu	\N	\N	1	\N	f
10	aa	bb	aaa	$2b$10$i84SjaWiv7dLXlNB5BgIw.vRWr/aOaiuSfadeEkC4xfTd3V8zxN0q	Miskolc	\N		User	2025-03-23 18:59:58.812992+01	2025-03-23 18:59:58.812992+01	\N	aaa@aaa.hu	\N	\N	0	\N	f
\.


--
-- TOC entry 4913 (class 0 OID 16404)
-- Dependencies: 221
-- Data for Name: termekek; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.termekek (id, felhasznalo_id, nev, leiras, ar, kategoria, kep_url, created_at, updated_at, deleted_at) FROM stdin;
32	3	xcxcxcxc		3200		https://res.cloudinary.com/ds9w2ccsn/image/upload/v1742755186/wxgolxr02n3ic1sjd13e.jpg	2025-03-23 19:39:48.290378+01	2025-03-23 19:39:48.290378+01	\N
27	3	termék 40000	oewr woperwekrpőpl234234 2ü őú2 lő23lé4 2ő42p4l 2ll 2ű3á 24	54000	categoria 2	https://res.cloudinary.com/ds9w2ccsn/image/upload/v1742746035/bdo4mviczugjwxwutcco.jpg	2025-03-23 16:52:35.547468+01	2025-03-23 17:07:17.084787+01	\N
23	3	23432434	2342342	234243	234	https://res.cloudinary.com/ds9w2ccsn/image/upload/v1742746070/dtxwgilyexhei4uf9l7x.jpg	2025-03-22 16:24:50.809228+01	2025-03-23 17:07:52.520971+01	2025-03-23 20:31:16.215963+01
24	3	cccccxxx	ccc	120000	reger	https://res.cloudinary.com/ds9w2ccsn/image/upload/v1742761122/d97xllomxi0ebunwzqwj.jpg	2025-03-22 16:25:24.687411+01	2025-03-23 21:18:43.926384+01	\N
22	3	Termék Admin 1	Termék Admin 1 Termék Admin 1 1 Termék Admin 1 1 Termék Admin 1 1 Termék Admin 1 1 Termék Admin 1 1 Termék Admin 1	2300	csoport3		2025-03-22 14:40:42.221946+01	2025-03-22 14:40:42.221946+01	\N
25	3	Termák 100 	wpr pwelrő34é2űáé4 ű23é4űá23é4	3500	KAtegória 1	https://res.cloudinary.com/ds9w2ccsn/image/upload/v1742742454/dbeddbmjgjxjrxiogyrq.jpg	2025-03-23 16:07:36.759377+01	2025-03-23 16:07:36.759377+01	\N
26	3	Termék 10000	ower wpoerk leé,r,wpop42l34 2áerl 2őp3 42ál3 áé2léáe	32000	categoria 100	\N	2025-03-23 16:52:06.735422+01	2025-03-23 16:52:06.735422+01	\N
19	3	Janitermék 01ssxxxx	ez egy termék	1200	csoport 1	https://res.cloudinary.com/ds9w2ccsn/image/upload/v1742761167/o1d7vo8nrnqhnisem8be.jpg	2025-03-21 19:23:06.15994+01	2025-03-23 21:19:28.865454+01	\N
30	3	werwer		13000		\N	2025-03-23 19:19:46.477274+01	2025-03-23 21:35:35.731021+01	\N
28	3	termék XXX	re eáé lőpplt áérlt áééetpertl ,áéeőp45é 43lél3á4534 5	12400	cat4	https://res.cloudinary.com/ds9w2ccsn/image/upload/v1742746114/bajghojvpkrtg0rxeifp.jpg	2025-03-23 17:08:36.638682+01	2025-03-23 17:08:36.638682+01	\N
29	5	Termék -gipsz 01ssss	ewr ewrw er we	24100	cat 1000	https://res.cloudinary.com/ds9w2ccsn/image/upload/v1742751669/dtysouvj9mylcmbptmwt.jpg	2025-03-23 18:40:44.258566+01	2025-03-23 18:41:11.766925+01	\N
31	3	xyxyx		1200		\N	2025-03-23 19:39:34.351476+01	2025-03-23 19:39:34.351476+01	\N
\.


--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 218
-- Name: felhasznalok_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.felhasznalok_id_seq', 12, true);


--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 220
-- Name: termekek_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.termekek_id_seq', 32, true);


--
-- TOC entry 4758 (class 2606 OID 16401)
-- Name: felhasznalok felhasznalok_felhasznalonev_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.felhasznalok
    ADD CONSTRAINT felhasznalok_felhasznalonev_key UNIQUE (felhasznalonev);


--
-- TOC entry 4760 (class 2606 OID 16399)
-- Name: felhasznalok felhasznalok_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.felhasznalok
    ADD CONSTRAINT felhasznalok_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 16413)
-- Name: termekek termekek_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.termekek
    ADD CONSTRAINT termekek_pkey PRIMARY KEY (id);


--
-- TOC entry 4761 (class 1259 OID 16402)
-- Name: idx_felhasznalok_felhasznalonev; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_felhasznalok_felhasznalonev ON public.felhasznalok USING btree (felhasznalonev);


--
-- TOC entry 4764 (class 2606 OID 16414)
-- Name: termekek termekek_felhasznalo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.termekek
    ADD CONSTRAINT termekek_felhasznalo_id_fkey FOREIGN KEY (felhasznalo_id) REFERENCES public.felhasznalok(id);


-- Completed on 2025-03-24 00:17:40

--
-- PostgreSQL database dump complete
--

