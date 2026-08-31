import {
  FiHome,
  FiSearch,
  FiClock,
  FiBarChart2,
  FiCpu,
  FiSettings,
} from "react-icons/fi";

export const navigation = [
  {
    title: "Dashboard",
    icon: FiHome,
    path: "/dashboard",
    requiresScanId: false,
  },
  {
    title: "New Scan",
    icon: FiSearch,
    path: "/scan",
    requiresScanId: true,
  },
  {
    title: "Scan History",
    icon: FiClock,
    path: "/history",
  },
  {
    title: "Analytics",
    icon: FiBarChart2,
    path: "/analytics",
    requiresScanId: true,
  },
  {
    title: "AI Remediation",
    icon: FiCpu,
    path: "/ai",
    requiresScanId: true,
  },
  {
    title: "Settings",
    icon: FiSettings,
    path: "/settings",
    requiresScanId: true,
  },
];