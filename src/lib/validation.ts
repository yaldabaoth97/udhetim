import { z } from "zod";

// Albanian phone: +355 followed by 8-9 digits
export const albanianPhoneRegex = /^\+355\s?\d{2}\s?\d{3}\s?\d{3,4}$/;

export const phoneSchema = z
  .string()
  .regex(albanianPhoneRegex, "Invalid Albanian phone number format")
  .optional()
  .or(z.literal(""));

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: phoneSchema,
  locale: z.enum(["sq", "en"]).default("sq"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const rideSchema = z.object({
  originCity: z.string().min(1, "Origin city is required"),
  destinationCity: z.string().min(1, "Destination city is required"),
  departureTime: z.coerce.date().refine((date) => date > new Date(), {
    message: "Departure time must be in the future",
  }),
  pricePerSeat: z.number().int().positive("Price must be a positive number"),
  totalSeats: z
    .number()
    .int()
    .min(1, "At least 1 seat required")
    .max(8, "Maximum 8 seats"),
  notes: z.string().optional(),
});

export const bookingSchema = z.object({
  rideId: z.string().cuid(),
  seatsRequested: z.number().int().min(1, "At least 1 seat required"),
  message: z.string().optional(),
});

export const searchSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  date: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RideInput = z.infer<typeof rideSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
