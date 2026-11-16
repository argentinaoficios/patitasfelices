/* Datos de muestra: se usan solo si todavía no conectaste tu Apps Script (modo demostración). */
window.PF_DEMO = {
 "categorias": [
  {
   "slug": "alimentos",
   "nombre": "Alimentos Balanceados",
   "icono": "nutrition"
  },
  {
   "slug": "juguetes",
   "nombre": "Juguetes Interactivos",
   "icono": "sports_baseball"
  },
  {
   "slug": "camas",
   "nombre": "Camas y Confort",
   "icono": "bed"
  },
  {
   "slug": "higiene",
   "nombre": "Higiene y Cuidado",
   "icono": "soap"
  },
  {
   "slug": "accesorios",
   "nombre": "Accesorios",
   "icono": "pets"
  }
 ],
 "productos": [
  {
   "slug": "alimento-premium-cordero-arroz",
   "nombre": "Alimento Premium Cordero & Arroz 15kg",
   "categoria": "alimentos",
   "precio": 45990,
   "precioAnterior": null,
   "descripcion": "Nutrición óptima adaptada a cada etapa de su vida. Cordero real como primer ingrediente, sin colorantes ni conservantes artificiales.",
   "stock": 40,
   "etiqueta": "Más Vendido",
   "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuCcIL4D9UsAYRMEX0TJC2PVQtOX8aEiRa0WeDqBD3-8G-MiN0yxyTWKDAQdgxSWTx5RELjzV2Qh5XZVUIXVD-u01NGgcMVnalysoe1XUb58iDwPQtfGiyfgEPSRf4BHSVJ89wdhCsO3kbQ-1q8T-7ArzYq1yEVlLR2v9_E2C__KDn3fat1C-1lCRA5bKbK80uH9vE2U6QMfZvWSSozu-e__q-u5JZ87XVCHNVAlar8",
   "activo": true
  },
  {
   "slug": "mordedor-interactivo-premios",
   "nombre": "Juguete Interactivo Dispensador de Premios",
   "categoria": "juguetes",
   "precio": 19990,
   "precioAnterior": 24990,
   "descripcion": "Estimulación mental y máximo disfrute. Dispensa premios mientras tu perro juega; materiales resistentes y seguros.",
   "stock": 25,
   "etiqueta": "-15% Descuento",
   "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuBzRsZMazo8O8IC5Wm0JDNhtVQcv448-YGJrMRFczAa7f8NzGvhqioQ7EXsw-Qq-LcP7pw32RSIDXAuLQuucotyErCN6ZFNM0NG7eDB1cjgjM0MoRWCJctNMqf3r0kwxdsphY5rRZqtearHCTScK82Sp7n-LV02XOHRmJybsl7tQbT8hR8H-Z_9b_VF-5ab-t-Sp-NlKMiiNhV6b7fA0UavQK89Zc6qza0mXxtTmi0",
   "activo": true
  },
  {
   "slug": "cama-ortopedica-memory-foam",
   "nombre": "Cama Ortopédica Memory Foam Confort XL",
   "categoria": "camas",
   "precio": 69990,
   "precioAnterior": null,
   "descripcion": "Descanso reparador para sus articulaciones. Funda desmontable y lavable.",
   "stock": 12,
   "etiqueta": "",
   "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuCYJ2fQALVboPkhCmEBAdmpATyQgESwbRUZPUaXqV-OS5I4xcB0y-xPRX4TQUWUErTbStfoxnSCl01DB9GnXYRxPIktDB5vOUjLUrZ4VRV0QaLabn1qOfw3TfMqrJ_ppJwmmYViZC7KSfmf9NDwmBb3PR2MM0VmD7OqswxU-Zr6q_EF6qKobf20IG8m4ZFsHboXdZMuAJHxsn6YU_yISRh6hnTPGEHRL8g_HJ9gbWk",
   "activo": true
  },
  {
   "slug": "shampoo-avena-aloe",
   "nombre": "Shampoo Orgánico de Avena y Aloe Vera 500ml",
   "categoria": "higiene",
   "precio": 14500,
   "precioAnterior": null,
   "descripcion": "Fórmula natural para un pelaje brillante y suave. Hipoalergénico.",
   "stock": 60,
   "etiqueta": "Nuevo",
   "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuC6yWtI3GFtqsyg7gjYtHdLayAVj40JAFcjQWExTPr-gxLFEPnbbI__ur6fyj9eZSbT4Sfa2HfIxNJKcAQ_VpcWOdODIEbNhRgDHzA0MiS4CTVeA-K06fKFoec1IhTyQc0Q0XBehFVUY77lnJs97xVtrR1VQXilET2AM6Bc92eSFWGWXEOJxldFuLLEgwatsO6ffq1TOPHedI3Q2lN2qg4wZ-glHeU8xu3dcS10GJI",
   "activo": true
  },
  {
   "slug": "abrigo-impermeable-terracota",
   "nombre": "Abrigo Impermeable de Invierno",
   "categoria": "accesorios",
   "precio": 32900,
   "precioAnterior": null,
   "descripcion": "Abrigo impermeable con forro polar, ideal para días fríos y lluviosos.",
   "stock": 18,
   "etiqueta": "",
   "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuC_nkw9tohuxz9iot5VAYhDGEPC1liUXtIJQjjbUg9npGjbiZmBbv6pj-ZM6PD360ylMVtu_gv17nYFY_8U0n1XP62t--a5f4vSSl3-wJcjg1TPSR3cpCV_2-pr_G9SqMrKoM-_HqDrauPAPKRR2GPyHaEqAbSitXtrIJX_KMa1eaZ4_xK3In4Y84n_BML1qXLp_Hv1IyubL1MZGFDGqDKbOJ2Ve7M_B2UI25xJFYY",
   "activo": true
  },
  {
   "slug": "hueso-nylon-pollo",
   "nombre": "Hueso de Nylon Sabor Pollo",
   "categoria": "juguetes",
   "precio": 8900,
   "precioAnterior": null,
   "descripcion": "Mordedor ultra resistente con sabor a pollo. Ayuda a la limpieza dental.",
   "stock": 50,
   "etiqueta": "",
   "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuAwDjYgy4NGAyGKwskvqSChYh_aoMTh0rF4XmyWYupQ8x6CDklBOyAiCsMP7z5CCeO5E1_nNQ3zMpbyX_0ruSajYu06iDwyiJA_g4oN_MLTL2R0WOyD7yZohHAVn3T3CzJDuzNrnlrLFg_xYc_0MlugnhkUOe1yj9ZYaepu4GZdEHaox9XLi0p7B1yNNedN5Yj5JpRpiWoQ8IX6heaZ8Oe5dA9j3-HJc-LzNcvccRU",
   "activo": true
  },
  {
   "slug": "snacks-dentales-naturales",
   "nombre": "Snacks Dentales Naturales",
   "categoria": "alimentos",
   "precio": 7600,
   "precioAnterior": null,
   "descripcion": "Bastones dentales naturales que reducen el sarro y refrescan el aliento.",
   "stock": 80,
   "etiqueta": "",
   "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuDumBbmyXV9WQEJYCYtwK-ZZNmJLlOpL812S04gJsXVjAXoV__F5N26p-kzbURwym6f_uLry4SnVmdDhiwBXnl8tL0Pe-ozh5YZBplZrBv5ipWIJFIOm096ZTv0akuPDLgdW2v0YmR3bFHGRUcGCZ21ebTg7J6SGlQRRLWtDZrPgk-r4v-UCT3NUo-Y-tOrtoK-Pn7_KhzXk8JQPqKdzmzg5oHVxt-qOfX2nRaV1X8",
   "activo": true
  },
  {
   "slug": "arnes-reflectante-correa",
   "nombre": "Arnés Reflectante con Correa",
   "categoria": "accesorios",
   "precio": 21900,
   "precioAnterior": null,
   "descripcion": "Arnés ergonómico con bandas reflectantes y correa a juego, para paseos seguros.",
   "stock": 30,
   "etiqueta": "",
   "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuC6xhBroC9BCcQmZwpD_P9SqEcfiIXYDDaCDH6GZV3vH8XVdyjJqm9Z9Ph_hy7ocT0_bPa__EFxklYwmOqf2X1q0738U0V2BflN5HLZuYh9tQSl9oMM_oP9pU8nhxTMiWvKk7do-bXHPmphCq6QhXqmuYpDc-0byj4qEVaL6FfmV26kEx5QRhpaZ4vuMiECZTpdbjHEf_ecNw2xpxnJbQ18yn-Zu2GfTCmlcTHCGjU",
   "activo": true
  },
  {
   "slug": "comedero-doble-antideslizante",
   "nombre": "Comedero Doble Antideslizante de Acero",
   "categoria": "accesorios",
   "precio": 16500,
   "precioAnterior": null,
   "descripcion": "Estación de comida y agua en acero inoxidable sobre base de bambú elevada.",
   "stock": 22,
   "etiqueta": "",
   "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuArTVaYwDnY-0M58A6_od8bCWvJVH3r0evVGet76bRlOc7qP8syjqQoKYxmWqngqBhNA-GzuRl-Lxli-WHyf4YYPUhlwUsqFxGzI9HkhQXtAbtVZb0aJ8qNvq-fvyGbMbKF8Ucsl-EyIqJbNjBBuV29TtwuFLjtX_292IGUFlvMuNaVDCkswbHaQQ_--KNCFuRJSwGMTrWQJYdhhdRrXkBilGdZGKLUh4y3wjbMF-4",
   "activo": true
  }
 ]
};
