import {
  Car,
  Compass,
  Heart,
  Hotel,
  Luggage,
  Map as MapIcon,
  Plane,
  Shield,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICON_WHITELIST: Record<string, LucideIcon> = {
  Map: MapIcon,
  Plane,
  Hotel,
  Car,
  Compass,
  Users,
  Heart,
  Shield,
  Star,
  Passport: Luggage,
};

/** Whitelisted lucide icons by admin-provided name (module-level lookup map). */
export const BRUTAL_ICONS = ICON_WHITELIST;

export const DEFAULT_BRUTAL_ICON = MapIcon;
