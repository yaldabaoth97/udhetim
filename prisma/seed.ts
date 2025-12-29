import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cities = [
  {
    name: "Tirana",
    nameSq: "Tirana",
    nameEn: "Tirana",
    lat: 41.3275,
    lng: 19.8187,
    isPopular: true,
  },
  {
    name: "Durres",
    nameSq: "Durrës",
    nameEn: "Durres",
    lat: 41.3246,
    lng: 19.4565,
    isPopular: true,
  },
  {
    name: "Vlore",
    nameSq: "Vlorë",
    nameEn: "Vlora",
    lat: 40.4667,
    lng: 19.4897,
    isPopular: true,
  },
  {
    name: "Shkoder",
    nameSq: "Shkodër",
    nameEn: "Shkodra",
    lat: 42.0693,
    lng: 19.5033,
    isPopular: true,
  },
  {
    name: "Elbasan",
    nameSq: "Elbasan",
    nameEn: "Elbasan",
    lat: 41.1125,
    lng: 20.0822,
    isPopular: true,
  },
  {
    name: "Korce",
    nameSq: "Korçë",
    nameEn: "Korce",
    lat: 40.6186,
    lng: 20.7808,
    isPopular: true,
  },
  {
    name: "Fier",
    nameSq: "Fier",
    nameEn: "Fier",
    lat: 40.7239,
    lng: 19.5567,
    isPopular: true,
  },
  {
    name: "Berat",
    nameSq: "Berat",
    nameEn: "Berat",
    lat: 40.7058,
    lng: 19.9522,
    isPopular: true,
  },
  {
    name: "Gjirokaster",
    nameSq: "Gjirokastër",
    nameEn: "Gjirokastra",
    lat: 40.0758,
    lng: 20.1389,
    isPopular: true,
  },
  {
    name: "Sarande",
    nameSq: "Sarandë",
    nameEn: "Saranda",
    lat: 39.8661,
    lng: 20.005,
    isPopular: true,
  },
  {
    name: "Pogradec",
    nameSq: "Pogradec",
    nameEn: "Pogradec",
    lat: 40.9025,
    lng: 20.6525,
    isPopular: false,
  },
  {
    name: "Lezhe",
    nameSq: "Lezhë",
    nameEn: "Lezha",
    lat: 41.7836,
    lng: 19.6436,
    isPopular: false,
  },
  {
    name: "Kukes",
    nameSq: "Kukës",
    nameEn: "Kukes",
    lat: 42.0769,
    lng: 20.4219,
    isPopular: false,
  },
  {
    name: "Permet",
    nameSq: "Përmet",
    nameEn: "Permet",
    lat: 40.2342,
    lng: 20.3517,
    isPopular: false,
  },
  {
    name: "Ksamil",
    nameSq: "Ksamil",
    nameEn: "Ksamil",
    lat: 39.7833,
    lng: 20.0,
    isPopular: true,
  },
  {
    name: "Himara",
    nameSq: "Himarë",
    nameEn: "Himara",
    lat: 40.1,
    lng: 19.75,
    isPopular: true,
  },
];

async function main() {
  console.log("Seeding Albanian cities...");

  for (const city of cities) {
    await prisma.city.upsert({
      where: { name: city.name },
      update: city,
      create: city,
    });
  }

  console.log(`Seeded ${cities.length} cities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
