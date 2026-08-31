import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

export default function SidebarItem({
  icon: Icon,
  title,
  path,
  collapsed,
}) {
  return (
    <NavLink to={path}>
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: 6 }}
          whileTap={{ scale: 0.97 }}
          className={`group relative flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300 ${
            isActive
              ? "bg-cyan-500/15 border border-cyan-400/30"
              : "hover:bg-white/5"
          }`}
        >
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-cyan-400"
            />
          )}

          <Icon
            size={22}
            className={
              isActive
                ? "text-cyan-300"
                : "text-gray-400 group-hover:text-white"
            }
          />

          {!collapsed && (
            <span className={isActive ? "text-white" : "text-gray-300"}>
              {title}
            </span>
          )}
        </motion.div>
      )}
    </NavLink>
  );
}