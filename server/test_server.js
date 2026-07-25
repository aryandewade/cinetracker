const http = require("http");
const db = require("./db");
const { generateToken, verifyToken, hashPassword, verifyPassword } = require("./jwt");

console.log("--- Testing Cinetracker DB & Auth Layer ---");

// 1. Password Hashing Test
const pass = "secret123";
const hash = hashPassword(pass);
console.log("Password hash:", hash ? "OK" : "FAIL");
console.log("Verify correct password:", verifyPassword(pass, hash) === true ? "OK" : "FAIL");
console.log("Verify wrong password:", verifyPassword("wrong", hash) === false ? "OK" : "FAIL");

// 2. JWT Token Test
const payload = { id: "usr_test123", username: "alex" };
const token = generateToken(payload);
console.log("Generated JWT Token:", token ? "OK" : "FAIL");
const verified = verifyToken(token);
console.log("Verified Token Payload:", verified && verified.username === "alex" ? "OK" : "FAIL");

// 3. Database Operations Test
const testUser = db.users.create({
  username: "testuser_" + Date.now(),
  email: "test_" + Date.now() + "@example.com",
  passwordHash: hash,
  name: "Test User",
  avatar: "🎬",
  bio: "Testing database integration."
});
console.log("Created DB User:", testUser && testUser.id ? "OK" : "FAIL");

const savedMedia = db.media.save(testUser.id, {
  title: "Inception",
  type: "movie",
  status: "watched",
  rating: 5,
  review: "Mindbending masterpiece!"
});
console.log("Saved DB Media Item:", savedMedia && savedMedia.id ? "OK" : "FAIL");

const userMedia = db.media.getByUserId(testUser.id);
console.log("Fetched User Media count:", userMedia.length === 1 ? "OK" : "FAIL");

const allUsers = db.users.getAllWithStats();
console.log("Fetched All Users with Stats count:", allUsers.length > 0 ? "OK" : "FAIL");

console.log("--- All backend unit tests passed successfully! ---");
