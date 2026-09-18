-- =====================================================================
-- Veteriner Klinik Otomasyonu - Temel Şema (Faz 0)
-- Postgres / Supabase
--
-- İLKE: Stok, cari ve LTV ayrı sistemler değildir. Hepsi "islem_satirlari"
-- ve "stok_hareketleri" defterlerinden türetilir. Miktar ve bakiye
-- HİÇBİR YERDE üzerine yazılmaz; her olay için yeni satır eklenir.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. Kiracı (her klinik bir tenant)
-- ---------------------------------------------------------------------
create table klinikler (
  id            uuid primary key default gen_random_uuid(),
  ad            text not null,
  telefon       text,
  adres         text,
  vergi_dairesi text,
  vergi_no      text,
  ayarlar       jsonb not null default '{}'::jsonb,  -- WA token, kritik seviye vb.
  aktif         boolean not null default true,
  created_at    timestamptz not null default now()
);

create type kullanici_rol as enum ('sahip','veteriner','sekreter','teknisyen','operator');

create table kullanicilar (
  id            uuid primary key default gen_random_uuid(),
  klinik_id     uuid not null references klinikler(id) on delete cascade,
  auth_user_id  uuid unique,                  -- supabase auth.users.id
  ad            text not null,
  telefon       text,
  rol           kullanici_rol not null default 'sekreter',
  aktif         boolean not null default true,
  created_at    timestamptz not null default now()
);
create index on kullanicilar (klinik_id);

-- ---------------------------------------------------------------------
-- 2. Hasta sahibi ve hasta (hayvan)
-- ---------------------------------------------------------------------
create table sahipler (
  id          uuid primary key default gen_random_uuid(),
  klinik_id   uuid not null references klinikler(id) on delete cascade,
  ad          text not null,
  telefon     text not null,                  -- 905321112233 formatı
  email       text,
  adres       text,
  tc_no       text,
  kvkk_onay   boolean not null default false,
  kvkk_tarih  timestamptz,
  notlar      text,
  aktif       boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (klinik_id, telefon)
);
create index on sahipler (klinik_id);

create type hayvan_turu  as enum ('kedi','kopek','kus','kemirgen','surungen','gelincik','diger');
create type hayvan_cinsiyet as enum ('erkek','disi','bilinmiyor');

create table hastalar (
  id                uuid primary key default gen_random_uuid(),
  klinik_id         uuid not null references klinikler(id) on delete cascade,
  sahip_id          uuid not null references sahipler(id) on delete restrict,
  ad                text not null,
  tur               hayvan_turu not null,
  irk               text,
  cinsiyet          hayvan_cinsiyet not null default 'bilinmiyor',
  dogum_tarihi      date,
  mikrocip_no       text,
  pasaport_no       text,
  kisirlastirilmis  boolean,
  gorsel_url        text,                     -- supabase storage
  kronik_notlar     text,
  alerjiler         text,
  aktif             boolean not null default true,  -- vefat/devir halinde false
  created_at        timestamptz not null default now()
);
create index on hastalar (klinik_id);
create index on hastalar (sahip_id);
create unique index on hastalar (klinik_id, mikrocip_no) where mikrocip_no is not null;

-- Kilo / diyet takip grafiğinin kaynağı
create table hasta_olcumler (
  id                    uuid primary key default gen_random_uuid(),
  hasta_id              uuid not null references hastalar(id) on delete cascade,
  tarih                 date not null default current_date,
  kilo_kg               numeric(6,3),
  vucut_kondisyon_skoru smallint check (vucut_kondisyon_skoru between 1 and 9),
  notlar                text,
  kaydeden_id           uuid references kullanicilar(id),
  created_at            timestamptz not null default now()
);
create index on hasta_olcumler (hasta_id, tarih desc);

-- ---------------------------------------------------------------------
-- 3. Ürün, lot ve STOK DEFTERİ
-- ---------------------------------------------------------------------
create type urun_kategori as enum ('ilac','asi','mama','sarf','aksesuar','diger');

create table urunler (
  id             uuid primary key default gen_random_uuid(),
  klinik_id      uuid not null references klinikler(id) on delete cascade,
  kod            text not null,               -- klinik içi ürün kodu
  ad             text not null,
  kategori       urun_kategori not null,
  birim          text not null default 'adet',-- adet / ml / kg / tablet
  barkod         text,
  kritik_seviye  numeric(12,3) not null default 0,
  kdv_orani      smallint not null default 10,
  alis_fiyat     numeric(12,2),
  satis_fiyat    numeric(12,2),
  receteli       boolean not null default false,
  miat_takipli   boolean not null default true,
  aktif          boolean not null default true,
  created_at     timestamptz not null default now(),
  unique (klinik_id, kod)
);
create index on urunler (klinik_id);
create index on urunler (klinik_id, barkod);

create table lotlar (
  id            uuid primary key default gen_random_uuid(),
  urun_id       uuid not null references urunler(id) on delete cascade,
  lot_no        text,
  miat          date,
  giris_tarihi  date not null default current_date,
  alis_fiyat    numeric(12,2),
  created_at    timestamptz not null default now()
);
create index on lotlar (urun_id);
create index on lotlar (miat) where miat is not null;

create type stok_hareket_tipi   as enum ('giris','cikis','sayim','fire','iade','transfer');
create type stok_hareket_kaynak as enum ('mal_kabul','muayene','perakende','manuel','sayim','fire','transfer');

-- ===== STOK DEFTERİ =====
-- miktar: giriş için POZİTİF, çıkış için NEGATİF. Asla update edilmez.
create table stok_hareketleri (
  id            uuid primary key default gen_random_uuid(),
  klinik_id     uuid not null references klinikler(id) on delete cascade,
  urun_id       uuid not null references urunler(id) on delete restrict,
  lot_id        uuid references lotlar(id) on delete restrict,
  tip           stok_hareket_tipi not null,
  kaynak        stok_hareket_kaynak not null,
  miktar        numeric(12,3) not null check (miktar <> 0),
  birim_fiyat   numeric(12,2),
  islem_id      uuid,                          -- FK aşağıda (islemler)
  hasta_id      uuid references hastalar(id) on delete set null,
  kullanici_id  uuid references kullanicilar(id),
  aciklama      text,
  created_at    timestamptz not null default now()
);
create index on stok_hareketleri (klinik_id, urun_id);
create index on stok_hareketleri (klinik_id, created_at desc);
create index on stok_hareketleri (islem_id);

-- ---------------------------------------------------------------------
-- 4. Hizmetler, işlemler ve CARİ DEFTERİ
-- ---------------------------------------------------------------------
create table hizmetler (
  id          uuid primary key default gen_random_uuid(),
  klinik_id   uuid not null references klinikler(id) on delete cascade,
  kod         text not null,
  ad          text not null,                   -- muayene, aşı uygulama, tıraş, otel/gece
  fiyat       numeric(12,2) not null default 0,
  sure_dk     smallint not null default 20,    -- randevu süresi (Faz 3)
  kdv_orani   smallint not null default 20,
  aktif       boolean not null default true,
  unique (klinik_id, kod)
);

create type islem_tipi   as enum ('muayene','asi','kuafor','otel','operasyon','perakende','laboratuvar','diger');
create type islem_durumu as enum ('acik','tamamlandi','iptal');

create table islemler (
  id            uuid primary key default gen_random_uuid(),
  klinik_id     uuid not null references klinikler(id) on delete cascade,
  sahip_id      uuid not null references sahipler(id) on delete restrict,
  hasta_id      uuid references hastalar(id) on delete set null,  -- perakendede null olabilir
  tip           islem_tipi not null,
  durum         islem_durumu not null default 'acik',
  personel_id   uuid references kullanicilar(id),
  tarih         timestamptz not null default now(),
  indirim       numeric(12,2) not null default 0,
  notlar        text,
  created_at    timestamptz not null default now()
);
create index on islemler (klinik_id, tarih desc);
create index on islemler (sahip_id);
create index on islemler (hasta_id);

alter table stok_hareketleri
  add constraint stok_hareketleri_islem_fk
  foreign key (islem_id) references islemler(id) on delete set null;

-- ===== İŞLEM SATIRI = stok + cari + LTV'nin ortak kaynağı =====
create table islem_satirlari (
  id            uuid primary key default gen_random_uuid(),
  islem_id      uuid not null references islemler(id) on delete cascade,
  urun_id       uuid references urunler(id),
  hizmet_id     uuid references hizmetler(id),
  aciklama      text not null,
  miktar        numeric(12,3) not null default 1,
  birim_fiyat   numeric(12,2) not null default 0,
  kdv_orani     smallint not null default 20,
  -- KAÇAK RAPORUNUN KALBİ: kullanıldı ama ücretlendirilmedi
  ucretlendirildi boolean not null default true,
  created_at    timestamptz not null default now(),
  check (urun_id is not null or hizmet_id is not null)
);
create index on islem_satirlari (islem_id);
create index on islem_satirlari (urun_id);

create type cari_hareket_tipi as enum ('borc','tahsilat','iade','devir');
create type odeme_yontemi     as enum ('nakit','kredi_karti','havale','veresiye','diger');

-- ===== CARİ DEFTERİ ===== tutar: borç POZİTİF, tahsilat NEGATİF
create table cari_hareketler (
  id            uuid primary key default gen_random_uuid(),
  klinik_id     uuid not null references klinikler(id) on delete cascade,
  sahip_id      uuid not null references sahipler(id) on delete restrict,
  tip           cari_hareket_tipi not null,
  tutar         numeric(12,2) not null check (tutar <> 0),
  odeme         odeme_yontemi,
  islem_id      uuid references islemler(id) on delete set null,
  aciklama      text,
  kullanici_id  uuid references kullanicilar(id),
  created_at    timestamptz not null default now()
);
create index on cari_hareketler (klinik_id, sahip_id);

-- ---------------------------------------------------------------------
-- 5. Koruyucu hekimlik (aşı / parazit) - Faz 2
-- ---------------------------------------------------------------------
create table protokoller (
  id              uuid primary key default gen_random_uuid(),
  klinik_id       uuid not null references klinikler(id) on delete cascade,
  ad              text not null,               -- Karma, Kuduz, İç Parazit, Dış Parazit
  tur             hayvan_turu,
  tekrar_ay       smallint,                    -- 3 = 3 ayda bir, 12 = yıllık
  ilk_uygulama_haftalik smallint,              -- yavruda ilk doz haftası
  aktif           boolean not null default true
);

create type uygulama_durumu as enum ('planlandi','uygulandi','kacirildi','iptal');

create table hasta_uygulamalari (
  id               uuid primary key default gen_random_uuid(),
  klinik_id        uuid not null references klinikler(id) on delete cascade,
  hasta_id         uuid not null references hastalar(id) on delete cascade,
  protokol_id      uuid references protokoller(id),
  uygulama_tarihi  date,
  sonraki_tarih    date,                       -- hatırlatma motoru buraya bakar
  durum            uygulama_durumu not null default 'planlandi',
  urun_id          uuid references urunler(id),
  lot_id           uuid references lotlar(id),
  veteriner_id     uuid references kullanicilar(id),
  islem_id         uuid references islemler(id) on delete set null,
  notlar           text,
  created_at       timestamptz not null default now()
);
create index on hasta_uygulamalari (klinik_id, sonraki_tarih) where durum = 'planlandi';
create index on hasta_uygulamalari (hasta_id);

create type hatirlatma_tipi   as enum ('asi','parazit','kontrol','mama','dogum_gunu','kayip_hasta');
create type hatirlatma_durumu as enum ('bekliyor','gonderildi','hata','iptal');

-- n8n bu tabloyu okur ve gönderir; panel de aynı tabloyu gösterir
create table hatirlatmalar (
  id            uuid primary key default gen_random_uuid(),
  klinik_id     uuid not null references klinikler(id) on delete cascade,
  hasta_id      uuid references hastalar(id) on delete cascade,
  sahip_id      uuid not null references sahipler(id) on delete cascade,
  tip           hatirlatma_tipi not null,
  hedef_tarih   date not null,
  mesaj         text,
  kanal         text not null default 'whatsapp',
  durum         hatirlatma_durumu not null default 'bekliyor',
  gonderildi_at timestamptz,
  hata_mesaji   text,
  created_at    timestamptz not null default now()
);
create index on hatirlatmalar (klinik_id, hedef_tarih) where durum = 'bekliyor';

-- ---------------------------------------------------------------------
-- 6. Randevu - Faz 3 (tip başına farklı süre: tıraş / aşı / muayene ayrı)
-- ---------------------------------------------------------------------
create type randevu_durumu as enum ('planlandi','onaylandi','geldi','gelmedi','iptal');
create type randevu_kaynak as enum ('panel','app','whatsapp','telefon','walkin');

create table randevular (
  id           uuid primary key default gen_random_uuid(),
  klinik_id    uuid not null references klinikler(id) on delete cascade,
  hasta_id     uuid references hastalar(id) on delete set null,
  sahip_id     uuid not null references sahipler(id) on delete cascade,
  tip          islem_tipi not null,
  baslangic    timestamptz not null,
  bitis        timestamptz not null,
  personel_id  uuid references kullanicilar(id),
  durum        randevu_durumu not null default 'planlandi',
  kaynak       randevu_kaynak not null default 'panel',
  notlar       text,
  islem_id     uuid references islemler(id) on delete set null,
  created_at   timestamptz not null default now(),
  check (bitis > baslangic)
);
create index on randevular (klinik_id, baslangic);

-- =====================================================================
-- GÖRÜNÜMLER - defterlerden türetilir, hiçbiri ayrıca saklanmaz
-- =====================================================================

-- Mevcut stok (ürün + lot bazında)
create view v_mevcut_stok as
select
  sh.klinik_id, sh.urun_id, u.kod, u.ad, u.kategori, u.birim,
  sh.lot_id, l.lot_no, l.miat,
  sum(sh.miktar) as mevcut,
  u.kritik_seviye
from stok_hareketleri sh
join urunler u on u.id = sh.urun_id
left join lotlar l on l.id = sh.lot_id
group by sh.klinik_id, sh.urun_id, u.kod, u.ad, u.kategori, u.birim,
         sh.lot_id, l.lot_no, l.miat, u.kritik_seviye
having sum(sh.miktar) <> 0;

-- Kritik seviyenin altına düşenler -> n8n alarmı + panel "Bugün" kartı
create view v_kritik_stok as
select klinik_id, urun_id, kod, ad, kategori, birim,
       sum(mevcut) as toplam, kritik_seviye
from v_mevcut_stok
group by klinik_id, urun_id, kod, ad, kategori, birim, kritik_seviye
having sum(mevcut) <= kritik_seviye;

-- Miadı yaklaşan / geçen lotlar -> miat zararı raporu
create view v_miat_takibi as
select klinik_id, urun_id, kod, ad, lot_id, lot_no, miat, mevcut,
       (miat - current_date) as kalan_gun
from v_mevcut_stok
where miat is not null and mevcut > 0;

-- ===== KAÇAK RAPORU: kullanıldı ama ücretlendirilmedi =====
create view v_faturalanmayan_kullanim as
select
  i.klinik_id, i.id as islem_id, i.tarih, i.tip,
  s.ad as sahip, h.ad as hasta,
  isr.aciklama, isr.miktar, isr.birim_fiyat,
  (isr.miktar * isr.birim_fiyat) as kayip_tutar
from islem_satirlari isr
join islemler i on i.id = isr.islem_id
join sahipler s on s.id = i.sahip_id
left join hastalar h on h.id = i.hasta_id
where isr.ucretlendirildi = false
  and i.durum <> 'iptal';

-- Sahip cari bakiyesi (+ borçlu)
create view v_cari_bakiye as
select klinik_id, sahip_id, sum(tutar) as bakiye
from cari_hareketler
group by klinik_id, sahip_id;

-- ===== LTV: satış argümanının kaynağı =====
create view v_sahip_ltv as
select
  i.klinik_id,
  i.sahip_id,
  s.ad as sahip,
  count(distinct i.id)                                   as islem_sayisi,
  min(i.tarih)                                           as ilk_ziyaret,
  max(i.tarih)                                           as son_ziyaret,
  sum(isr.miktar * isr.birim_fiyat) filter (where isr.ucretlendirildi) as toplam_ciro,
  (current_date - max(i.tarih)::date)                    as gun_once
from islemler i
join islem_satirlari isr on isr.islem_id = i.id
join sahipler s on s.id = i.sahip_id
where i.durum = 'tamamlandi'
group by i.klinik_id, i.sahip_id, s.ad;

-- Kayıp hasta: 180 gündür gelmeyen -> geri kazanım kampanyası
create view v_kayip_hastalar as
select * from v_sahip_ltv where gun_once > 180;
