import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Create navigation utilities that automatically handle locale prefixes
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
