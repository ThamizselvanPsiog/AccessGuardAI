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
              ? "border border-cyan-400/30 bg-cyan-500/15"
              : "hover:bg-[var(--surface-hover)]"
          }`}
        >
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="
                absolute
                bottom-2
                left-0
                top-2
                w-1
                rounded-full
                bg-cyan-400
              "
            />
          )}

          <Icon
            size={22}
            className={
              isActive
                ? "text-[var(--theme-cyan)]"
                : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
            }
          />

          {!collapsed && (
            <span
              className={
                isActive
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)]"
              }
            >
              {title}
            </span>
          )}
        </motion.div>
      )}
    </NavLink>
  );
}