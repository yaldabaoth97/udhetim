import { PrismaClient, RideStatus, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Albanian cities with coordinates
const cities = [
  { name: "Tirana", nameSq: "Tirana", nameEn: "Tirana", lat: 41.3275, lng: 19.8187, isPopular: true },
  { name: "Durres", nameSq: "Durrës", nameEn: "Durres", lat: 41.3246, lng: 19.4565, isPopular: true },
  { name: "Vlore", nameSq: "Vlorë", nameEn: "Vlora", lat: 40.4667, lng: 19.4897, isPopular: true },
  { name: "Shkoder", nameSq: "Shkodër", nameEn: "Shkodra", lat: 42.0693, lng: 19.5033, isPopular: true },
  { name: "Elbasan", nameSq: "Elbasan", nameEn: "Elbasan", lat: 41.1125, lng: 20.0822, isPopular: true },
  { name: "Korce", nameSq: "Korçë", nameEn: "Korce", lat: 40.6186, lng: 20.7808, isPopular: true },
  { name: "Fier", nameSq: "Fier", nameEn: "Fier", lat: 40.7239, lng: 19.5567, isPopular: true },
  { name: "Berat", nameSq: "Berat", nameEn: "Berat", lat: 40.7058, lng: 19.9522, isPopular: true },
  { name: "Gjirokaster", nameSq: "Gjirokastër", nameEn: "Gjirokastra", lat: 40.0758, lng: 20.1389, isPopular: true },
  { name: "Sarande", nameSq: "Sarandë", nameEn: "Saranda", lat: 39.8661, lng: 20.005, isPopular: true },
  { name: "Pogradec", nameSq: "Pogradec", nameEn: "Pogradec", lat: 40.9025, lng: 20.6525, isPopular: false },
  { name: "Lezhe", nameSq: "Lezhë", nameEn: "Lezha", lat: 41.7836, lng: 19.6436, isPopular: false },
  { name: "Kukes", nameSq: "Kukës", nameEn: "Kukes", lat: 42.0769, lng: 20.4219, isPopular: false },
  { name: "Permet", nameSq: "Përmet", nameEn: "Permet", lat: 40.2342, lng: 20.3517, isPopular: false },
  { name: "Ksamil", nameSq: "Ksamil", nameEn: "Ksamil", lat: 39.7833, lng: 20.0, isPopular: true },
  { name: "Himara", nameSq: "Himarë", nameEn: "Himara", lat: 40.1, lng: 19.75, isPopular: true },
];

// Mock users with Albanian names
const mockUsers = [
  { name: "Arben Hoxha", email: "arben.hoxha@email.com", phone: "+355 69 123 4567" },
  { name: "Elira Shehu", email: "elira.shehu@email.com", phone: "+355 68 234 5678" },
  { name: "Dritan Leka", email: "dritan.leka@email.com", phone: "+355 69 345 6789" },
  { name: "Flutura Krasniqi", email: "flutura.k@email.com", phone: "+355 67 456 7890" },
  { name: "Besnik Dema", email: "besnik.dema@email.com", phone: "+355 69 567 8901" },
  { name: "Mirela Topi", email: "mirela.topi@email.com", phone: "+355 68 678 9012" },
  { name: "Genti Rama", email: "genti.rama@email.com", phone: "+355 69 789 0123" },
  { name: "Anila Basha", email: "anila.basha@email.com", phone: "+355 67 890 1234" },
  { name: "Ilir Malaj", email: "ilir.malaj@email.com", phone: "+355 69 901 2345" },
  { name: "Vera Murati", email: "vera.murati@email.com", phone: "+355 68 012 3456" },
  { name: "Kujtim Berisha", email: "kujtim.b@email.com", phone: "+355 69 111 2222" },
  { name: "Dorina Gjika", email: "dorina.gjika@email.com", phone: "+355 67 333 4444" },
  { name: "Agron Prifti", email: "agron.prifti@email.com", phone: "+355 69 555 6666" },
  { name: "Lindita Cela", email: "lindita.cela@email.com", phone: "+355 68 777 8888" },
  { name: "Ermal Koci", email: "ermal.koci@email.com", phone: "+355 69 999 0000" },
];

// Popular routes with realistic pricing (in Lekë)
const popularRoutes = [
  { origin: "Tirana", destination: "Durres", price: 300, duration: 40 },
  { origin: "Tirana", destination: "Vlore", price: 1200, duration: 150 },
  { origin: "Tirana", destination: "Shkoder", price: 800, duration: 100 },
  { origin: "Tirana", destination: "Elbasan", price: 400, duration: 50 },
  { origin: "Tirana", destination: "Korce", price: 1000, duration: 180 },
  { origin: "Tirana", destination: "Berat", price: 700, duration: 120 },
  { origin: "Tirana", destination: "Gjirokaster", price: 1500, duration: 240 },
  { origin: "Durres", destination: "Vlore", price: 1000, duration: 130 },
  { origin: "Vlore", destination: "Sarande", price: 600, duration: 90 },
  { origin: "Sarande", destination: "Ksamil", price: 200, duration: 20 },
  { origin: "Shkoder", destination: "Tirana", price: 800, duration: 100 },
  { origin: "Korce", destination: "Pogradec", price: 300, duration: 35 },
  { origin: "Vlore", destination: "Himara", price: 400, duration: 60 },
  { origin: "Berat", destination: "Fier", price: 250, duration: 30 },
  { origin: "Elbasan", destination: "Korce", price: 600, duration: 90 },
];

function getRandomFutureDate(daysAhead: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  // Random hour between 6 AM and 9 PM
  date.setHours(6 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 4) * 15, 0, 0);
  return date;
}

function getRandomPastDate(daysBack: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack) - 1);
  date.setHours(6 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 4) * 15, 0, 0);
  return date;
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Seed cities
  console.log("📍 Seeding Albanian cities...");
  for (const city of cities) {
    await prisma.city.upsert({
      where: { name: city.name },
      update: city,
      create: city,
    });
  }
  console.log(`   ✓ Seeded ${cities.length} cities\n`);

  // Create password hash (same for all demo users for easy testing)
  const demoPassword = await bcrypt.hash("demo1234", 12);

  // Seed users
  console.log("👥 Seeding users...");
  const createdUsers: { id: string; name: string }[] = [];

  for (const userData of mockUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        phone: userData.phone,
      },
      create: {
        email: userData.email,
        passwordHash: demoPassword,
        name: userData.name,
        phone: userData.phone,
        locale: "sq",
      },
    });
    createdUsers.push({ id: user.id, name: user.name });
  }
  console.log(`   ✓ Seeded ${createdUsers.length} users (password: demo1234)\n`);

  // Delete existing rides and bookings for clean seed
  console.log("🧹 Cleaning existing rides and bookings...");
  await prisma.booking.deleteMany({});
  await prisma.ride.deleteMany({});
  console.log("   ✓ Cleaned\n");

  // Create rides
  console.log("🚗 Seeding rides...");
  const createdRides: { id: string; driverId: string; availableSeats: number }[] = [];

  // Future active rides (what users will see when searching)
  for (let i = 0; i < 20; i++) {
    const route = popularRoutes[i % popularRoutes.length];
    const driver = createdUsers[i % createdUsers.length];
    const totalSeats = 3 + Math.floor(Math.random() * 2); // 3-4 seats
    const bookedSeats = Math.floor(Math.random() * 2); // 0-1 already booked

    // Add some price variation (±15%)
    const priceVariation = 0.85 + Math.random() * 0.3;
    const price = Math.round(route.price * priceVariation / 50) * 50; // Round to nearest 50

    const originCity = cities.find(c => c.name === route.origin)!;
    const destCity = cities.find(c => c.name === route.destination)!;

    const ride = await prisma.ride.create({
      data: {
        driverId: driver.id,
        originCity: route.origin,
        originLat: originCity.lat,
        originLng: originCity.lng,
        destinationCity: route.destination,
        destinationLat: destCity.lat,
        destinationLng: destCity.lng,
        departureTime: getRandomFutureDate(14), // Next 2 weeks
        pricePerSeat: price,
        totalSeats,
        availableSeats: totalSeats - bookedSeats,
        status: RideStatus.ACTIVE,
        notes: i % 3 === 0 ? "Luggage space available" : i % 4 === 0 ? "Pet-friendly" : null,
      },
    });
    createdRides.push({ id: ride.id, driverId: driver.id, availableSeats: ride.availableSeats });
  }

  // Some completed past rides (for history)
  for (let i = 0; i < 10; i++) {
    const route = popularRoutes[i % popularRoutes.length];
    const driver = createdUsers[(i + 5) % createdUsers.length];

    const originCity = cities.find(c => c.name === route.origin)!;
    const destCity = cities.find(c => c.name === route.destination)!;

    await prisma.ride.create({
      data: {
        driverId: driver.id,
        originCity: route.origin,
        originLat: originCity.lat,
        originLng: originCity.lng,
        destinationCity: route.destination,
        destinationLat: destCity.lat,
        destinationLng: destCity.lng,
        departureTime: getRandomPastDate(30), // Past month
        pricePerSeat: route.price,
        totalSeats: 4,
        availableSeats: 0,
        status: RideStatus.COMPLETED,
      },
    });
  }
  console.log(`   ✓ Seeded 30 rides (20 active, 10 completed)\n`);

  // Create bookings
  console.log("📋 Seeding bookings...");
  let bookingCount = 0;

  for (const ride of createdRides) {
    // Create 1-2 bookings per ride that has fewer available seats
    if (ride.availableSeats < 3) {
      const numBookings = Math.min(2, 4 - ride.availableSeats);

      for (let b = 0; b < numBookings; b++) {
        // Pick a random rider (not the driver)
        const availableRiders = createdUsers.filter(u => u.id !== ride.driverId);
        const rider = availableRiders[Math.floor(Math.random() * availableRiders.length)];

        try {
          await prisma.booking.create({
            data: {
              rideId: ride.id,
              riderId: rider.id,
              seatsRequested: 1,
              status: BookingStatus.ACCEPTED,
              message: b === 0 ? "Looking forward to the trip!" : null,
            },
          });
          bookingCount++;
        } catch {
          // Skip if duplicate booking (rider already booked this ride)
        }
      }
    }
  }

  // Add some pending bookings
  for (let i = 0; i < 5; i++) {
    const ride = createdRides[i + 10]; // Pick rides that likely have seats
    const availableRiders = createdUsers.filter(u => u.id !== ride.driverId);
    const rider = availableRiders[Math.floor(Math.random() * availableRiders.length)];

    try {
      await prisma.booking.create({
        data: {
          rideId: ride.id,
          riderId: rider.id,
          seatsRequested: 1 + Math.floor(Math.random() * 2),
          status: BookingStatus.PENDING,
          message: "Hi! Is this ride still available?",
        },
      });
      bookingCount++;
    } catch {
      // Skip duplicates
    }
  }
  console.log(`   ✓ Seeded ${bookingCount} bookings\n`);

  // Summary
  console.log("✅ Seed completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`   Cities:   ${cities.length}`);
  console.log(`   Users:    ${createdUsers.length}`);
  console.log(`   Rides:    30 (20 active + 10 completed)`);
  console.log(`   Bookings: ${bookingCount}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📧 Demo accounts (password: demo1234):");
  console.log("   arben.hoxha@email.com");
  console.log("   elira.shehu@email.com");
  console.log("   dritan.leka@email.com");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
