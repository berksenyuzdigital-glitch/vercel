export const clinic = {
  name: "AUREA",
  tagline: "Dental Atelier",
  city: "İstanbul",
  address: "Teşvikiye Cad. No 42, Nişantaşı / İstanbul",
  phone: "+90 212 000 00 00",
  phoneHref: "tel:+902120000000",
  mail: "merhaba@aureadental.com",
  hours: [
    { day: "Pazartesi — Cuma", value: "09:00 — 19:00" },
    { day: "Cumartesi", value: "10:00 — 16:00" },
    { day: "Pazar", value: "Kapalı" },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Youtube", href: "https://youtube.com" },
    { label: "Linkedin", href: "https://linkedin.com" },
  ],
};

export type Service = {
  id: string;
  index: string;
  title: string;
  short: string;
  description: string;
  duration: number;
  priceFrom: string;
  tags: string[];
};

export const services: Service[] = [
  {
    id: "gulus-tasarimi",
    index: "01",
    title: "Gülüş Tasarımı",
    short: "Dijital simülasyon ile yüz oranlarınıza özel gülüş.",
    description:
      "3D yüz taraması ve dijital mock-up ile tedaviye başlamadan önce yeni gülüşünüzü görürsünüz. Porselen laminalar tek tek elde şekillendirilir.",
    duration: 60,
    priceFrom: "48.000 ₺",
    tags: ["Dijital mock-up", "Laminate", "E-max"],
  },
  {
    id: "implant",
    index: "02",
    title: "İmplantoloji",
    short: "Navigasyonlu cerrahi ile aynı gün sabit diş.",
    description:
      "Tomografi verisiyle planlanan cerrahi kılavuzlar sayesinde implantlar milimetrik doğrulukla yerleştirilir; çoğu vakada aynı gün geçici sabit diş teslim edilir.",
    duration: 90,
    priceFrom: "32.000 ₺",
    tags: ["Guided surgery", "All-on-4", "Aynı gün diş"],
  },
  {
    id: "seffaf-plak",
    index: "03",
    title: "Şeffaf Plak Ortodonti",
    short: "Görünmeyen plaklarla fark edilmeden hizalama.",
    description:
      "Ağız içi tarayıcı ile alınan ölçüden üretilen plak serisi, tedavinin ilk gününde tüm adımların simülasyonunu sunar. Ortalama tedavi süresi 6—14 ay.",
    duration: 45,
    priceFrom: "78.000 ₺",
    tags: ["Invisalign", "3D simülasyon", "Retainer"],
  },
  {
    id: "estetik-dolgu",
    index: "04",
    title: "Estetik Restorasyon",
    short: "Kompozit bonding ile aynı seansta form düzeltme.",
    description:
      "Tabakalama tekniğiyle uygulanan kompozit, mine geçirgenliğini birebir taklit eder. Diş kesimi yapılmadan, tek seansta tamamlanır.",
    duration: 45,
    priceFrom: "6.500 ₺",
    tags: ["Bonding", "Kesimsiz", "Tek seans"],
  },
  {
    id: "beyazlatma",
    index: "05",
    title: "Beyazlatma & Bakım",
    short: "Hassasiyet oluşturmayan klinik protokolü.",
    description:
      "Ofis tipi beyazlatma ve ev tipi bakım seti bir arada planlanır; mine yüzeyi remineralize edilerek renk stabilitesi korunur.",
    duration: 45,
    priceFrom: "9.800 ₺",
    tags: ["Ofis tipi", "Hassasiyetsiz", "Bakım seti"],
  },
  {
    id: "cocuk-dis",
    index: "06",
    title: "Pedodonti",
    short: "Korkusuz ilk deneyim için oyunlaştırılmış seans.",
    description:
      "Çocuklara özel odada, koruyucu uygulamalar ve fissür örtücüler ile ilk muayene bir oyuna dönüşür. 3—14 yaş arası takip programı.",
    duration: 30,
    priceFrom: "2.400 ₺",
    tags: ["Koruyucu", "Fissür örtücü", "3—14 yaş"],
  },
];

export type Doctor = {
  id: string;
  name: string;
  role: string;
  focus: string;
  since: string;
  accent: string;
  initials: string;
};

export const doctors: Doctor[] = [
  {
    id: "dr-elif-narin",
    name: "Dr. Elif Narin",
    role: "Estetik Diş Hekimi",
    focus: "Gülüş tasarımı, laminate veneer",
    since: "2011",
    accent: "#a8e6c9",
    initials: "EN",
  },
  {
    id: "dr-kaan-aksoy",
    name: "Dr. Kaan Aksoy",
    role: "Ağız & Çene Cerrahı",
    focus: "İmplantoloji, guided surgery",
    since: "2008",
    accent: "#c9a887",
    initials: "KA",
  },
  {
    id: "dr-sena-yildiz",
    name: "Dr. Sena Yıldız",
    role: "Ortodonti Uzmanı",
    focus: "Şeffaf plak, dijital ortodonti",
    since: "2014",
    accent: "#b9c8f2",
    initials: "SY",
  },
  {
    id: "dr-mert-oral",
    name: "Dr. Mert Oral",
    role: "Pedodonti Uzmanı",
    focus: "Çocuk diş hekimliği, koruyucu tedavi",
    since: "2016",
    accent: "#e6c9a8",
    initials: "MO",
  },
];

export const stats = [
  { value: "14", suffix: "yıl", label: "Klinik deneyimi" },
  { value: "9.400", suffix: "+", label: "Tamamlanan tedavi" },
  { value: "38", suffix: "ülke", label: "Uluslararası hasta" },
  { value: "4.9", suffix: "/5", label: "Hasta memnuniyeti" },
];

export const process = [
  {
    step: "01",
    title: "Dijital Muayene",
    text: "Ağız içi tarayıcı, tomografi ve yüz analizi ile 40 dakikalık kapsamlı bir kayıt alınır. Hiçbir işlem bu veriler olmadan planlanmaz.",
  },
  {
    step: "02",
    title: "Tasarım Seansı",
    text: "Yeni gülüşünüz ekranda birlikte tasarlanır. Mock-up ağzınıza uygulanır; onaylamadığınız hiçbir form üretime girmez.",
  },
  {
    step: "03",
    title: "Uygulama",
    text: "Kendi laboratuvarımızda üretilen restorasyonlar, mikroskop altında ve tek hekim sorumluluğunda uygulanır.",
  },
  {
    step: "04",
    title: "Takip Programı",
    text: "Tedavi bittiğinde 24 aylık kontrol takvimi açılır. Hatırlatmalar ve bakım seansları klinik tarafından planlanır.",
  },
];

export const testimonials = [
  {
    quote:
      "Yıllardır kapatarak güldüğüm dişlerim için üç farklı klinikte görüştüm. Aurea'da ilk kez ne yapılacağını ekranda gördüm ve karar vermek kolaylaştı.",
    name: "Deniz A.",
    detail: "Gülüş tasarımı · 10 diş laminate",
  },
  {
    quote:
      "İmplant süreci korktuğum kadar zor değildi. Sabah işlem oldum, öğleden sonra toplantıdaydım. Takip aramaları da gerçekten yapıldı.",
    name: "Murat T.",
    detail: "İmplantoloji · All-on-4",
  },
  {
    quote:
      "Kızım diş hekimine gitmeyi oyun sanıyor. Bu tek başına her şeyi anlatıyor sanırım.",
    name: "Ceren B.",
    detail: "Pedodonti · Koruyucu program",
  },
  {
    quote:
      "Şeffaf plak tedavim 9 ay sürdü, hiç kimse fark etmedi. Her ay ilerlemeyi karşılaştırmalı görmek motive ediciydi.",
    name: "Ayşe K.",
    detail: "Ortodonti · Şeffaf plak",
  },
];

export const faq = [
  {
    q: "Randevu için ön ödeme gerekiyor mu?",
    a: "Hayır. İlk muayene randevusu için herhangi bir ön ödeme alınmaz. Randevunuzu ücretsiz olarak 24 saat öncesine kadar erteleyebilirsiniz.",
  },
  {
    q: "İlk seans ne kadar sürüyor?",
    a: "Dijital muayene ortalama 40—60 dakika sürer. Tarama, röntgen ve tedavi planının anlatımı bu süreye dahildir.",
  },
  {
    q: "Yurt dışından geliyorum, süreç nasıl işliyor?",
    a: "Fotoğraf ve mevcut röntgenlerinizle ön değerlendirme yapılır, size gün bazlı bir tedavi takvimi gönderilir. Konaklama ve transfer organizasyonunu klinik koordinatörümüz üstlenir.",
  },
  {
    q: "Ödeme seçenekleri neler?",
    a: "Tüm kredi kartlarına 12 aya kadar taksit, havale ve anlaşmalı finans kuruluşları ile ödeme planı sunulmaktadır.",
  },
  {
    q: "Anlaşmalı olduğunuz sigortalar var mı?",
    a: "Başlıca özel sağlık sigortaları ve tamamlayıcı sigortalarla anlaşmamız bulunuyor. Randevu öncesi poliçenizi ileterek kapsam kontrolü isteyebilirsiniz.",
  },
];
